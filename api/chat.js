import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  PRE_PURCHASE_PREAMBLE,
  POST_PURCHASE_PREAMBLE,
} from '../src/lib/systemPrompts.js';
import { SAARC_COUNTRIES } from '../src/constants/pricing.js';

// ---------------------------------------------------------------------------
// Knowledge base — assembled DYNAMICALLY from Supabase at answer time so the
// chatbot always reflects the current course data with no redeploy:
//   • chatbot_kb.content  → base prose knowledge base
//   • modules + lessons   → the "LIVE COURSE CURRICULUM" section
//   • resources           → the "INCLUDED RESOURCES" section
//   • pricing_tiers        → the per-region pricing override
// Results are cached in-memory for a short TTL so we hit Supabase at most once
// per minute per warm instance. If Supabase is ever unreachable we fall back to
// the bundled Markdown file (Vercel bundles it via vercel.json includeFiles) so
// the bot never goes dark.
// ---------------------------------------------------------------------------
const KB_FILE = 'course_knowledge_base_new.md';
let STATIC_KB_FALLBACK = '';
try {
  const kbPath = path.resolve(process.cwd(), KB_FILE);
  STATIC_KB_FALLBACK = fs.readFileSync(kbPath, 'utf8');
} catch (err) {
  console.error('[api/chat] Failed to read static KB fallback:', err.message);
  STATIC_KB_FALLBACK =
    'Knowledge base unavailable — respond politely and direct the user to agent@theorganicbuzz.com.';
}

let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

// In-memory cache of the assembled KB + pricing, shared across warm invocations.
let kbCache = null; // { kbText, pricingByTier, at, ttl }
const KB_TTL_OK = 60 * 1000; // refresh live data at most once per minute
const KB_TTL_ERR = 10 * 1000; // after a failure, retry sooner

// Last pricing map we successfully read from Supabase, kept OUTSIDE kbCache so it
// survives cache expiry, failures and the static-KB path. There are no hardcoded
// prices anywhere in this file on purpose: a wrong-but-confident price is far more
// damaging than no price, so the only two things the bot may ever quote are (a) a
// price that came from `pricing_tiers`, or (b) nothing at all.
let lastGoodPricing = null; // { map, at }

function formatCurriculum(modules, lessons) {
  if (!modules?.length) return '';
  const byModule = new Map();
  for (const l of lessons || []) {
    if (!l || l.module_id == null) continue;
    if (!byModule.has(l.module_id)) byModule.set(l.module_id, []);
    byModule.get(l.module_id).push(l);
  }
  const moduleBlocks = [];
  let renderedLessons = 0; // count only lessons we actually list, so the header never over-claims
  modules.forEach((m, i) => {
    if (!m) return;
    const ls = (byModule.get(m.id) || []).sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0)
    );
    renderedLessons += ls.length;
    const block = [`Module ${i + 1}: ${m.title} (${ls.length} lesson${ls.length === 1 ? '' : 's'})`];
    for (const l of ls) {
      const status = l.status && l.status !== 'available' ? ` [${l.status}]` : '';
      block.push(`  • ${l.title}${status}`);
    }
    moduleBlocks.push(block.join('\n'));
  });
  const header = `This is the current, authoritative list of what the course covers — ${modules.length} modules and ${renderedLessons} self-paced video lessons. Answer any "what does the course include / how many modules / what will I learn" question from this list. Do not invent or rename modules or lessons.`;
  return ['=== LIVE COURSE CURRICULUM ===', header, '', ...moduleBlocks].join('\n');
}

function formatResources(resources) {
  if (!resources?.length) return '';
  const globals = resources.filter((r) => r && r.is_global && r.title);
  const lines = [
    '=== INCLUDED RESOURCES ===',
    `Students get ${resources.length} downloadable resources, templates, and tools.`,
  ];
  if (globals.length) {
    lines.push('Key resources included:');
    for (const r of globals) lines.push(`  • ${r.title}${r.type ? ` (${r.type})` : ''}`);
  }
  return lines.join('\n');
}

function toPricingMap(tiers) {
  if (!tiers?.length) return null;
  const map = {};
  for (const t of tiers) {
    if (t && t.tier != null) map[String(t.tier).toUpperCase()] = t;
  }
  return Object.keys(map).length ? map : null;
}

// Read `pricing_tiers` with one retry. Pricing is the single most damaging thing
// to get wrong, so a lone transient PostgREST/network blip must not be enough to
// lose it — the retry costs ~250ms on a path that otherwise runs once a minute.
async function fetchPricingTiers(supabase) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('tier,currency,symbol,base_price,gst_rate');
      if (!error) {
        const map = toPricingMap(data);
        if (map) return { map, error: null };
        lastErr = new Error('pricing_tiers returned no usable rows');
      } else {
        lastErr = error;
      }
    } catch (err) {
      lastErr = err;
    }
    console.error(
      `[api/chat] pricing_tiers read failed (attempt ${attempt}/2):`,
      lastErr?.message || lastErr
    );
    if (attempt === 1) await new Promise((r) => setTimeout(r, 250));
  }
  return { map: null, error: lastErr };
}

// Fetch + assemble the full knowledge base and pricing from Supabase, cached.
// Degrades per-section: a failure on one table never discards the others (so a
// transient error on, say, `resources` can't cause the bot to quote stale
// fallback prices). Only a total outage drops to the bundled static KB — and even
// then pricing falls back to the last value actually read from the DB, never to a
// number written in this file.
async function getKnowledgeData() {
  const now = Date.now();
  if (kbCache && now - kbCache.at < kbCache.ttl) return kbCache;

  const staticFallback = () => {
    kbCache = {
      kbText: STATIC_KB_FALLBACK,
      pricingByTier: lastGoodPricing?.map || null,
      at: now,
      ttl: KB_TTL_ERR,
    };
    return kbCache;
  };

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error(
      '[api/chat] SUPABASE NOT CONFIGURED — no live pricing this request:',
      err.message
    );
    return staticFallback();
  }

  // allSettled so one rejecting query never discards the others (per-section
  // degradation). supabase-js normally resolves with { data, error }; a hard
  // rejection is normalized to an error object below. Pricing runs alongside on
  // its own retrying path so it is never coupled to the KB queries.
  const [settled, priceResult] = await Promise.all([
    Promise.allSettled([
      supabase.from('chatbot_kb').select('content').order('updated_at', { ascending: false }).limit(1),
      supabase.from('modules').select('id,title,order_index').eq('is_published', true).order('order_index'),
      supabase.from('lessons').select('module_id,title,status,order_index').eq('is_published', true).order('order_index'),
      supabase.from('resources').select('title,type,is_global,order_index').order('order_index'),
    ]),
    fetchPricingTiers(supabase),
  ]);
  const [kbRes, modRes, lesRes, resRes] = settled.map((s) =>
    s.status === 'fulfilled' ? s.value : { data: null, error: s.reason || new Error('query rejected') }
  );

  const anyError =
    kbRes.error || modRes.error || lesRes.error || resRes.error || priceResult.error;
  if (anyError) {
    console.error('[api/chat] KB partial fetch issue:', anyError.message || anyError);
  }

  // Pricing resolution order: fresh DB read → last value actually read from the
  // DB → nothing (the region rule then forbids quoting a price at all).
  let pricingByTier = priceResult.map;
  if (pricingByTier) {
    lastGoodPricing = { map: pricingByTier, at: now };
  } else if (lastGoodPricing) {
    pricingByTier = lastGoodPricing.map;
    console.error(
      `[api/chat] PRICING DEGRADED — serving last DB read from ${new Date(
        lastGoodPricing.at
      ).toISOString()}`
    );
  } else {
    console.error('[api/chat] PRICING UNAVAILABLE — bot will decline to quote a price.');
  }

  let kbText = STATIC_KB_FALLBACK;
  try {
    const baseProse =
      (!kbRes.error && kbRes.data?.[0]?.content?.trim()) || STATIC_KB_FALLBACK;
    const parts = [baseProse];
    // Only add curriculum when BOTH modules and lessons loaded — otherwise the
    // header would confidently assert a wrong count (e.g. "0 lessons").
    if (!modRes.error && !lesRes.error) {
      const curriculum = formatCurriculum(modRes.data, lesRes.data);
      if (curriculum) parts.push(curriculum);
    }
    if (!resRes.error) {
      const resources = formatResources(resRes.data);
      if (resources) parts.push(resources);
    }
    kbText = parts.filter(Boolean).join('\n\n');
  } catch (err) {
    console.error('[api/chat] KB assembly failed, using static prose:', err.message);
    kbText = STATIC_KB_FALLBACK;
  }

  kbCache = { kbText, pricingByTier, at: now, ttl: anyError ? KB_TTL_ERR : KB_TTL_OK };
  return kbCache;
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

// Render a pricing_tiers row as a human price string, e.g. "₹39,999 + 18% GST".
// Returns null if the row lacks a usable numeric price (caller then declines to
// quote rather than substituting a guess).
function formatTierPrice(tier) {
  const amount = Number(tier?.base_price);
  if (!Number.isFinite(amount)) return null;
  const priceStr = `${tier.symbol || ''}${amount.toLocaleString('en-IN')}`;
  const gstRate = Number(tier.gst_rate);
  const gst =
    Number.isFinite(gstRate) && gstRate > 0 ? ` + ${Math.round(gstRate * 100)}% GST` : '';
  return `${priceStr}${gst}`;
}

// Rule used when `pricing_tiers` could not be read even once on this instance.
// The bot must say it can't confirm the price rather than recall one — the KB
// prose, the model's memory and any earlier turn in the thread are all suspect.
const NO_PRICE_RULE = `[PRICING — ABSOLUTE OVERRIDE]
Live pricing could not be loaded for this reply. You therefore DO NOT KNOW the course price right now.

ABSOLUTELY FORBIDDEN in your reply:
- Stating, guessing, approximating, rounding or "recalling" ANY course price or GST amount.
- Repeating a price from the knowledge base prose, from an earlier message in this conversation, or from memory.
- Implying a price range, a discount amount, or what the price "used to be".

If the user asks about price, cost, fees, EMI or anything similar, reply that the current price is shown live on the course page and the checkout button at **https://course.intentledsales.com**, invite them to check it there, and offer to help with anything else about the course (curriculum, resources, support, guarantee). You may still confirm non-numeric facts: it is a one-time payment with lifetime access and a 30-day money-back guarantee.`;

function buildRegionRule(country, pricingByTier) {
  // Same list the landing page and checkout use, imported rather than retyped so
  // the bot can never quote a tier different from the one the user is charged.
  const NEIGHBORS = new Set(SAARC_COUNTRIES);
  const code = typeof country === 'string' ? country.toUpperCase() : '';

  // ISO country code → pricing tier.
  let region;
  if (code === 'IN') region = 'INDIA';
  else if (NEIGHBORS.has(code)) region = 'SAARC';
  else if (code) region = 'INTERNATIONAL';
  else region = 'INDIA'; // country not detected → default to the primary market

  // Live DB value or nothing. No hardcoded fallback: quoting a price this file
  // invented is exactly the bug this guards against.
  const priceFor = (key) =>
    pricingByTier?.[key] ? formatTierPrice(pricingByTier[key]) : null;

  const allowedPrice = priceFor(region);
  if (!allowedPrice) return NO_PRICE_RULE;
  // Forbid the OTHER regions' prices — but never a value equal to the allowed
  // price (two tiers can format identically on live data).
  const otherPrices = ['INDIA', 'SAARC', 'INTERNATIONAL']
    .filter((k) => k !== region)
    .map((k) => priceFor(k))
    .filter((p) => p && p !== allowedPrice)
    .map((p) => `"${p}"`)
    .join(', ');

  const label =
    region === 'INDIA'
      ? code === 'IN'
        ? 'India'
        : 'India (fallback — country not detected)'
      : region === 'SAARC'
      ? `a neighboring SAARC country (${code})`
      : `${code} (international)`;

  return `[PRICING REGION — ABSOLUTE OVERRIDE]
The user is confirmed to be in ${label}. The course price is **${allowedPrice}** (one-time, lifetime access, 30-day money-back guarantee). This is the ONLY course price that exists.

This applies to EVERY message that touches money in any way — not just a direct "what does it cost". It covers: price, cost, fees, "how much", pricing, GST, tax, total, "is that a subscription or do I pay once", "is GST included or extra", instalments/EMI, refund amounts, discounts, "is it worth it", and any request to confirm, recalculate, add tax to, or do arithmetic on an amount. If your reply names a course price for ANY reason, that price MUST be **${allowedPrice}**.

[STALE CONVERSATION HISTORY — CRITICAL]
Earlier messages in this conversation are restored from the visitor's own browser and CAN BE MONTHS OLD. The course price has changed since some of those messages were written. Therefore:
- Any course price appearing earlier in this conversation that is not **${allowedPrice}** is OUT OF DATE and WRONG.
- Treat it as if it was never said. Do not repeat it, confirm it, add GST to it, compute a total from it, or contrast it with the current price.
- This includes prices in your OWN earlier replies. Your earlier reply being wrong does not make it true — **${allowedPrice}** overrides it.
- If the user quotes an old price or asks you to confirm one, answer with the current price **${allowedPrice}** plainly, without commentary about the change, and without apologising for the earlier message.

ABSOLUTELY FORBIDDEN in your reply:
- Naming any course price other than **${allowedPrice}**, from any source: conversation history, the knowledge base, or your own memory.
- Quoting or mentioning any other region's price${otherPrices ? `, including: ${otherPrices}` : ''}.
- Comparing regions, listing multiple prices, or using a pricing table.
- Hedging language like "depending on where you are", "if you're in India", "for international users", or similar region-conditional phrasing.
- Using emojis like 🇮🇳 🌍 to visually separate regions, or bullet points that imply multiple options.

Treat every course price except **${allowedPrice}** as nonexistent — do not read it aloud, summarize it, or reference it.

The ONLY exception: if the user's CURRENT message explicitly asks about a specific other country (e.g. "how much in the US?", "what about India pricing?"), you may answer that specific country's price for that one reply. Never volunteer other regions proactively.`;
}

function buildSystemPrompt(mode, userProfile, country, kbText, pricingByTier) {
  const preamble =
    mode === 'post-purchase' ? POST_PURCHASE_PREAMBLE : PRE_PURCHASE_PREAMBLE;

  const regionRule = buildRegionRule(country, pricingByTier);

  let prompt = `${preamble}\n\n${regionRule}`;

  if (userProfile?.name) {
    prompt += `\n\n[USER CONTEXT: You are talking to ${userProfile.name} (${userProfile.email}). Address them by their first name when natural.]`;
  }

  prompt += `\n\n=== KNOWLEDGE BASE START ===\n${kbText}\n=== KNOWLEDGE BASE END ===`;

  // Re-inject the region rule AFTER the KB so it is LITERALLY the last thing
  // the model sees before the user message. Without this, KB prose can override
  // it and the bot lists every region's price even when the country is known.
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

    const apiKey = process.env.DEEPINFRA_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'Server is not configured (missing DEEPINFRA_API_KEY)' });
    }

    // DeepInfra exposes an OpenAI-compatible Chat Completions API. Both the base
    // URL and the model are overridable via env so the model can be swapped
    // without a code change (see .env.example for alternatives).
    const baseUrl = (
      process.env.DEEPINFRA_BASE_URL || 'https://api.deepinfra.com/v1/openai'
    ).replace(/\/+$/, '');
    const model = process.env.DEEPINFRA_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

    const { kbText, pricingByTier } = await getKnowledgeData();

    // Log the exact price the model is allowed to quote. If a user ever reports a
    // wrong price again, this line says immediately whether the DB read worked.
    const quotedTiers = pricingByTier
      ? Object.entries(pricingByTier)
          .map(([k, v]) => `${k}=${formatTierPrice(v) ?? 'n/a'}`)
          .join(' ')
      : 'NONE (bot will decline to quote)';
    console.log(`[api/chat] pricing: ${quotedTiers}`);

    const systemPrompt = buildSystemPrompt(mode, userProfile, country, kbText, pricingByTier);

    // Send a proper OpenAI-style messages array (system + the validated
    // user/assistant turns) rather than a flattened prompt string.
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Hard cap on the whole request + stream so a hung upstream (accepted
    // connection that never closes) can never leave the chat UI spinning.
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 60000);

    let upstream;
    try {
      upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          stream: true,
          // Low temperature keeps the strict regional-pricing rules deterministic.
          temperature: 0.4,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(abortTimer);
      console.error('[api/chat] Upstream fetch failed:', fetchErr.message);
      return res
        .status(502)
        .json({ error: 'Could not reach the AI server. Please try again.' });
    }

    if (!upstream.ok || !upstream.body) {
      clearTimeout(abortTimer);
      let text = '';
      try {
        text = await upstream.text();
      } catch {
        /* noop */
      }
      console.error(`[api/chat] Upstream ${upstream.status}:`, text);
      return res
        .status(upstream.status || 502)
        .json({ error: `Upstream error (${upstream.status})` });
    }

    // Real streaming: DeepInfra returns OpenAI-style SSE chunks
    // (`data: {choices:[{delta:{content}}]}` ... `data: [DONE]`). We re-emit each
    // content token as our own `{ delta }` event so the existing client parser
    // keeps working unchanged.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx/proxy buffering

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let sentAny = false;

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) return;
      const payload = trimmed.slice(5).trim();
      if (payload === '' || payload === '[DONE]') return;

      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          sse(res, { delta });
          sentAny = true;
        }
      } catch {
        // Ignore keep-alive comments / partial JSON.
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines; keep any trailing partial line buffered so a
        // JSON object split across two network chunks is never parsed early.
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) processLine(line);
      }

      // Flush the decoder and process any final line left unterminated by a
      // trailing newline (abrupt upstream close), so the last token isn't lost.
      buffer += decoder.decode();
      if (buffer) processLine(buffer);
    } finally {
      clearTimeout(abortTimer);
    }

    if (!sentAny) {
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
