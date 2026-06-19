import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

// Editable chatbot knowledge-base prose document (single 'default' row).
// Mirrors api/admin/pricing.js: JWT-gated, service-role Supabase client.
// The chatbot backend (api/chat.js) reads this row and appends live sections
// (pricing, curriculum, resources), so this document should NOT contain a
// hardcoded course price — the bot quotes the live region price instead.

const MAX_LEN = 100_000;

// Advisory only: flag the known stale course-price strings so an admin who
// re-pastes the old hardcoded price gets a heads-up. Intentionally narrow so it
// does not fire on legitimate non-course figures (tool costs, value anchors).
const STALE_PRICE_RE = /₹\s?3,?999|₹\s?4,?000|\$\s?129\b/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = verifyAdminToken(req.headers.authorization, JWT_SECRET);
  if (!auth.valid) return res.status(401).json({ error: auth.error });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('chatbot_kb')
        .select('*')
        .eq('id', 'default')
        .single();
      // PGRST116 = no row found; return null so the UI shows an empty editor.
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json({ doc: data || null });
    }

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: 'Invalid JSON body' });
        }
      }

      const content = body?.content;
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'content must be a non-empty string' });
      }
      if (content.length > MAX_LEN) {
        return res.status(400).json({ error: `content exceeds ${MAX_LEN} characters` });
      }

      const { data, error } = await supabase
        .from('chatbot_kb')
        .upsert({ id: 'default', content }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;

      const warning = STALE_PRICE_RE.test(content)
        ? 'Heads up: this document appears to contain a hardcoded course price (e.g. ₹3,999 / $129). Pricing is injected dynamically from the pricing tiers — consider removing it so the bot never quotes a stale price.'
        : undefined;

      return res.status(200).json({ doc: data, warning });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin chatbot-kb API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
