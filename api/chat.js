import fs from 'node:fs';
import path from 'node:path';
import {
  PRE_PURCHASE_PREAMBLE,
  POST_PURCHASE_PREAMBLE,
} from '../src/lib/systemPrompts.js';

// Load knowledge base from the Markdown file at module init (cold-start).
// The file lives at the project root; Vercel bundles it via vercel.json's
// `includeFiles` config. Falls back gracefully if unreadable.
const KB_FILE = 'intentledsales-course-knowledge-base.md';
let KNOWLEDGE_BASE = '';
try {
  const kbPath = path.resolve(process.cwd(), KB_FILE);
  KNOWLEDGE_BASE = fs.readFileSync(kbPath, 'utf8');
} catch (err) {
  console.error('[api/chat] Failed to read knowledge base:', err.message);
  KNOWLEDGE_BASE =
    'Knowledge base unavailable — respond politely and direct the user to agent@theorganicbuzz.com.';
}

// Simple in-memory rate limit (per IP). Per-instance only — survives warm
// invocations, resets on cold start. Good enough for a small chat widget.
const RATE_LIMIT = 50;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count += 1;
  return true;
}

function buildSystemPrompt(mode, userProfile) {
  const preamble =
    mode === 'post-purchase' ? POST_PURCHASE_PREAMBLE : PRE_PURCHASE_PREAMBLE;

  let prompt = `${preamble}\n\n=== KNOWLEDGE BASE START ===\n${KNOWLEDGE_BASE}\n=== KNOWLEDGE BASE END ===`;

  if (userProfile?.name) {
    prompt += `\n\n[USER CONTEXT: You are talking to ${userProfile.name} (${userProfile.email}). Address them by their first name when natural.]`;
  }
  return prompt;
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  if (!Array.isArray(body.messages) || body.messages.length === 0)
    return 'messages array is required';
  for (const m of body.messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant'))
      return 'Invalid message role';
    if (typeof m.content !== 'string' || m.content.length > 3000)
      return 'Message content must be a string under 3000 chars';
  }
  if (body.mode !== 'pre-purchase' && body.mode !== 'post-purchase')
    return 'mode must be pre-purchase or post-purchase';
  return null;
}

function sse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function sseDone(res) {
  res.write('data: [DONE]\n\n');
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return res
        .status(429)
        .json({ error: 'Too many messages. Please wait a moment.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const validationError = validateBody(body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { messages, mode, userProfile } = body;

    const vpsUrl = process.env.CLAUDE_VPS_URL;
    const vpsKey = process.env.CLAUDE_VPS_API_KEY;
    if (!vpsUrl || !vpsKey) {
      return res
        .status(500)
        .json({ error: 'Server is not configured (missing Claude VPS env vars)' });
    }

    const systemPrompt = buildSystemPrompt(mode, userProfile);

    // Flatten the chat history into a single prompt string, since the VPS
    // endpoint accepts { prompt, system } rather than a message array.
    let promptText = '';
    for (const m of messages) {
      promptText += m.role === 'user' ? `Human: ${m.content}\n\n` : `Assistant: ${m.content}\n\n`;
    }
    promptText += 'Assistant:';

    let vpsRes;
    try {
      vpsRes = await fetch(`${vpsUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': vpsKey,
        },
        body: JSON.stringify({
          prompt: promptText,
          system: systemPrompt,
          model: 'claude-sonnet-4-6',
        }),
      });
    } catch (fetchErr) {
      console.error('[api/chat] Upstream fetch failed:', fetchErr.message);
      return res
        .status(502)
        .json({ error: 'Could not reach Claude server. Please try again.' });
    }

    if (!vpsRes.ok) {
      let text = '';
      try {
        text = await vpsRes.text();
      } catch {
        /* noop */
      }
      console.error(`[api/chat] Upstream ${vpsRes.status}:`, text);
      return res
        .status(vpsRes.status)
        .json({ error: `Upstream error (${vpsRes.status})` });
    }

    const data = await vpsRes.json();
    const result = typeof data?.result === 'string' ? data.result : '';

    // Fake streaming: send the result word-by-word as SSE so the existing
    // client code (which parses `data: {delta: ...}` lines) keeps working.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx/proxy buffering

    if (result) {
      const tokens = result.split(/(\s+)/);
      for (const token of tokens) {
        sse(res, { delta: token });
        // Tiny delay so the UI shows incremental rendering.
        await new Promise((r) => setTimeout(r, 10));
      }
    } else {
      sse(res, {
        delta:
          "I didn't get a reply from the server — please try again in a moment.",
      });
    }
    sseDone(res);
  } catch (err) {
    console.error('[api/chat] Uncaught error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
    try {
      sse(res, { error: 'Something went wrong.' });
      sseDone(res);
    } catch {
      /* noop */
    }
  }
}
