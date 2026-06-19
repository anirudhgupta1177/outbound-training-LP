import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  PRE_PURCHASE_PREAMBLE,
  POST_PURCHASE_PREAMBLE,
} from '../src/lib/systemPrompts.js';
import { tierForCountry, FALLBACK_TIERS } from '../src/constants/pricing.js';

// Bundled knowledge base — used as the OFFLINE FALLBACK only. At request time we
// load the editable prose doc from Supabase (chatbot_kb) and append live
// sections (pricing, curriculum, resources). This file (already price-stripped
// and curriculum-delegated) is the fallback when Supabase is unreachable or not
// configured. Vercel bundles it via vercel.json's `includeFiles` config.
const KB_FILE = 'course_knowledge_base_new.md';
let KB_FALLBACK = '';
try {
  const kbPath = path.resolve(process.cwd(), KB_FILE);
  KB_FALLBACK = fs.readFileSync(kbPath, 'utf8');
} catch (err) {
  console.error('[api/chat] Failed to read bundled KB fallback:', err.message);
  KB_FALLBACK =
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

// ── Live data cache (KB prose + pricing + curriculum + resources) ────────────
// Module-level so it survives warm invocations; resets on cold start. The 60s
// TTL matches /api/pricing's edge cache, so the bot, landing page and checkout
// converge on new data within roughly the same window. NEVER fetches `coupons`
// (sensitive discount codes must never reach the model).
const CACHE_TTL_MS = 60 * 1000;
let _cache = { kb: KB_FALLBACK, tiers: null, curriculum: '', resources: '', fetchedAt: 0 };

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

async function getLiveData() {
  const now = Date.now();
  if (_cache.fetchedAt && now - _cache.fetchedAt < CACHE_TTL_MS) return _cache;

  const fallback = {
    kb: KB_FALLBACK,
    tiers: null,
    curriculum: '',
    resources: '',
    fetchedAt: now,
  };

  const supabase = getSupabase();
  if (!supabase) {
    _cache = fallback;
    return _cache;
  }

  try {
    const [kbRes, tiersRes, modulesRes, lessonsRes, resourcesRes] = await Promise.all([
      supabase.from('chatbot_kb').select('content').eq('id', 'default').single(),
      supabase.from('pricing_tiers').select('*'),
      supabase
        .from('modules')
        .select('id, title, order_index, is_published')
        .eq('is_published', true)
        .order('order_index'),
      supabase
        .from('lessons')
        .select('module_id, title, order_index, is_published, status')
        .eq('is_published', true)
        .order('order_index'),
      supabase
        .from('resources')
        .select('title, type, category, description, is_global, order_index')
        .order('order_index'),
    ]);

    const kb = !kbRes.error && kbRes.data?.content ? kbRes.data.content : KB_FALLBACK;

    let tiers = null;
    if (!tiersRes.error && Array.isArray(tiersRes.data) && tiersRes.data.length) {
      tiers = {};
      for (const row of tiersRes.data) {
        tiers[row.tier] = {
          tier: row.tier,
          currency: row.currency,
          symbol: row.symbol,
          basePrice: Number(row.base_price),
          gstRate: Number(row.gst_rate),
        };
      }
    }

    const modules = !modulesRes.error && Array.isArray(modulesRes.data) ? modulesRes.data : [];
    const lessons = !lessonsRes.error && Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
    const resourceRows =
      !resourcesRes.error && Array.isArray(resourcesRes.data) ? resourcesRes.data : [];

    _cache = {
      kb,
      tiers,
      curriculum: buildCurriculumSection(modules, lessons),
      resources: buildResourcesSection(resourceRows),
      fetchedAt: now,
    };
    return _cache;
  } catch (err) {
    console.error('[api/chat] getLiveData failed, using fallback:', err.message);
    _cache = fallback;
    return _cache;
  }
}

// Render the live modules + lessons into a compact, authoritative curriculum
// block the model is instructed to treat as the source of truth for "what does
// the course cover" questions.
function buildCurriculumSection(modules, lessons) {
  if (!modules.length) return '';
  const byModule = new Map();
  for (const l of lessons) {
    if (!byModule.has(l.module_id)) byModule.set(l.module_id, []);
    byModule.get(l.module_id).push(l);
  }
  const lines = [
    '=== LIVE COURSE CURRICULUM ===',
    'The authoritative, current list of modules and lessons (sourced live from the course platform). Answer every "what does the course cover / what modules / what lessons / is there a lesson on X" question from this list. Do not invent or rename modules/lessons.',
    '',
  ];
  let n = 0;
  for (const m of modules) {
    n += 1;
    lines.push(`${n}. ${m.title}`);
    for (const l of byModule.get(m.id) || []) {
      const tag = l.status && l.status !== 'available' ? ` (${l.status})` : '';
      lines.push(`   - ${l.title}${tag}`);
    }
  }
  lines.push('');
  lines.push(`(Total: ${modules.length} modules, ${lessons.length} lessons.)`);
  lines.push('=== END LIVE COURSE CURRICULUM ===');
  return lines.join('\n');
}

// Render the included resources/assets. Surfaces the meaningful ones (global or
// described) in full; collapses repetitive per-lesson links to a deduped tail
// so the section stays readable.
function buildResourcesSection(resources) {
  if (!resources.length) return '';
  const notable = [];
  const generic = new Map(); // title -> count
  for (const r of resources) {
    const hasDesc = r.description && r.description.trim();
    if (r.is_global || hasDesc) {
      const desc = hasDesc ? ` — ${r.description.trim()}` : '';
      const cat = r.category ? ` [${r.category}]` : '';
      notable.push(`- ${r.title}${desc}${cat}`);
    } else {
      generic.set(r.title, (generic.get(r.title) || 0) + 1);
    }
  }
  const lines = [
    '=== INCLUDED RESOURCES ===',
    'Downloadable assets / templates / databases / guides included with the course (sourced live from the course platform):',
    '',
  ];
  for (const line of notable) lines.push(line);
  if (generic.size) {
    lines.push('');
    lines.push('Additional in-lesson resources:');
    for (const [title, count] of generic) {
      lines.push(`- ${title}${count > 1 ? ` (×${count})` : ''}`);
    }
  }
  lines.push('=== END INCLUDED RESOURCES ===');
  return lines.join('\n');
}

// Format a tier row (live or fallback shape) into the display price string the
// bot may quote. India (gst_rate > 0) renders "₹7,999 + GST"; others "$169".
function formatTierPrice(row) {
  const symbol = row.symbol || (row.currency === 'INR' ? '₹' : '$');
  const amount = Number(row.basePrice).toLocaleString(
    row.currency === 'INR' ? 'en-IN' : 'en-US'
  );
  const base = `${symbol}${amount}`;
  return row.gstRate > 0 ? `${base} + GST` : base;
}

function buildRuleTemplate(label, allowedPrice, forbiddenPhrases) {
  return `[PRICING REGION — ABSOLUTE OVERRIDE]
The user is confirmed to be in ${label}. For ANY pricing question ("what does it cost", "price", "fees", "how much", "pricing", "cost", and any paraphrase of these), your ENTIRE pricing answer MUST quote exactly one price: **${allowedPrice}** (one-time, lifetime access, 30-day money-back guarantee).

ABSOLUTELY FORBIDDEN in your reply:
- Mentioning any of these strings: ${forbiddenPhrases}.
- Comparing regions, listing multiple prices, or using a pricing table.
- Hedging language like "depending on where you are", "if you're in India", "for international users", or similar region-conditional phrasing.
- Using emojis like 🇮🇳 🌍 to visually separate regions, or bullet points that imply multiple options.

The KNOWLEDGE BASE may contain region-specific pricing context. You MUST treat every price except the one for ${label} as nonexistent — do not read those aloud, do not summarize them, do not reference them.

The ONLY exception: if the user's CURRENT message explicitly asks about a specific other country (e.g. "how much in the US?", "what about India pricing?"), you may answer that specific country's price for that one reply. Never volunteer other regions proactively.`;
}

// Build the region pricing override from LIVE pricing_tiers (falling back to the
// same static FALLBACK_TIERS the frontend uses if the DB is unreachable). Region
// → tier mapping is shared with the page + checkout via tierForCountry, so the
// bot can never quote a price the user wouldn't actually be charged.
function buildRegionRule(country, liveTiers) {
  const tiers = liveTiers || FALLBACK_TIERS;
  const code = typeof country === 'string' ? country.toUpperCase() : '';
  // Preserve the legacy "unknown country → India" default (primary market).
  const tierKey = code ? tierForCountry(code) : 'INDIA';
  const row = tiers[tierKey] || FALLBACK_TIERS[tierKey];
  const allowedPrice = formatTierPrice(row);

  // Forbid the OTHER tiers' prices so the model can't quote a different region.
  const forbidden = [];
  for (const k of ['INDIA', 'SAARC', 'INTERNATIONAL']) {
    if (k === tierKey) continue;
    const other = tiers[k] || FALLBACK_TIERS[k];
    if (other) forbidden.push(`"${formatTierPrice(other)}"`);
  }
  // Structural forbiddens to stop region-mixing language.
  forbidden.push('"International"', '"SAARC"', '"neighbor"', '"neighboring"', '"abroad"', '"overseas"');
  if (tierKey !== 'INDIA') forbidden.push('"India"', '"Indian"', '"GST"', '"INR"');

  let label;
  if (!code) label = 'India (fallback — country not detected)';
  else if (tierKey === 'INDIA') label = 'India';
  else if (tierKey === 'SAARC') label = `a neighboring/SAARC country (${code})`;
  else label = `${code} (international)`;

  return buildRuleTemplate(label, allowedPrice, forbidden.join(', '));
}

function buildSystemPrompt(mode, userProfile, country, kb, tiers, curriculum, resources) {
  const preamble =
    mode === 'post-purchase' ? POST_PURCHASE_PREAMBLE : PRE_PURCHASE_PREAMBLE;

  const regionRule = buildRegionRule(country, tiers);

  let prompt = `${preamble}\n\n${regionRule}`;

  if (userProfile?.name) {
    prompt += `\n\n[USER CONTEXT: You are talking to ${userProfile.name} (${userProfile.email}). Address them by their first name when natural.]`;
  }

  // Assemble the knowledge base: editable prose + live curriculum + live assets.
  let kbBody = kb || KB_FALLBACK;
  if (curriculum) kbBody += `\n\n${curriculum}`;
  if (resources) kbBody += `\n\n${resources}`;

  prompt += `\n\n=== KNOWLEDGE BASE START ===\n${kbBody}\n=== KNOWLEDGE BASE END ===`;

  // Re-inject the region rule AFTER the KB so it is LITERALLY the last thing the
  // model sees before the user message — the KB/curriculum must never override
  // the dynamic, region-correct price.
  prompt += `\n\n${regionRule}`;

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

    const { messages, mode, userProfile, country } = body;

    // Diagnostic — prints on every request so we can see what country was sent
    // and whether the region rule is being injected. Remove once confirmed.
    console.log(`[api/chat] country="${country ?? '(undefined)'}" mode="${mode}" msgs=${messages.length}`);

    const vpsUrl = process.env.CLAUDE_VPS_URL;
    const vpsKey = process.env.CLAUDE_VPS_API_KEY;
    if (!vpsUrl || !vpsKey) {
      return res
        .status(500)
        .json({ error: 'Server is not configured (missing Claude VPS env vars)' });
    }

    const live = await getLiveData();
    const systemPrompt = buildSystemPrompt(
      mode,
      userProfile,
      country,
      live.kb,
      live.tiers,
      live.curriculum,
      live.resources
    );

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
