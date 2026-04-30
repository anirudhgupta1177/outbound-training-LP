import { createClient } from '@supabase/supabase-js';

// Lazy-init the supabase admin client so a missing env var doesn't crash
// the whole function at module load.
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.CHATBOT_SUPABASE_URL;
  const key = process.env.CHATBOT_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  if (typeof body.name !== 'string' || !body.name.trim()) return 'Name is required';
  if (body.name.length > 200) return 'Name is too long';
  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email))
    return 'Valid email is required';
  if (body.mode !== 'pre-purchase' && body.mode !== 'post-purchase')
    return 'mode must be pre-purchase or post-purchase';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[api/leads] Supabase env vars missing — lead not persisted');
      return res.status(200).json({ message: 'ok (db bypassed)' });
    }

    const { error } = await supabase.from('chatbot_leads').insert([
      {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        type: body.mode,
      },
    ]);

    if (error) {
      console.error('[api/leads] Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store lead' });
    }

    return res.status(200).json({ message: 'Lead stored' });
  } catch (err) {
    console.error('[api/leads] Uncaught error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
