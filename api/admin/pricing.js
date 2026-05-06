import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

const VALID_TIERS = new Set(['INDIA', 'SAARC', 'INTERNATIONAL']);
const VALID_CURRENCIES = new Set(['INR', 'USD']);

function sanitizeUpdate(body) {
  const errors = [];
  const updates = {};

  if (body.currency !== undefined) {
    if (!VALID_CURRENCIES.has(body.currency)) errors.push('currency must be INR or USD');
    else updates.currency = body.currency;
  }

  if (body.symbol !== undefined) {
    if (typeof body.symbol !== 'string' || !body.symbol.trim()) errors.push('symbol must be a non-empty string');
    else updates.symbol = body.symbol.trim();
  }

  if (body.base_price !== undefined) {
    const v = Number(body.base_price);
    if (!Number.isFinite(v) || v <= 0) errors.push('base_price must be a positive number');
    else updates.base_price = v;
  }

  if (body.original_price !== undefined) {
    const v = Number(body.original_price);
    if (!Number.isFinite(v) || v <= 0) errors.push('original_price must be a positive number');
    else updates.original_price = v;
  }

  if (body.gst_rate !== undefined) {
    const v = Number(body.gst_rate);
    if (!Number.isFinite(v) || v < 0 || v >= 1) errors.push('gst_rate must be a number between 0 and 1 (e.g. 0.18 for 18%)');
    else updates.gst_rate = v;
  }

  return { updates, errors };
}

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
      const { data, error } = await supabase.from('pricing_tiers').select('*').order('tier');
      if (error) throw error;
      return res.status(200).json({ tiers: data || [] });
    }

    if (req.method === 'PUT') {
      const { tier } = req.query;
      if (!tier || !VALID_TIERS.has(tier)) {
        return res.status(400).json({ error: 'tier query param must be INDIA, SAARC, or INTERNATIONAL' });
      }
      const { updates, errors } = sanitizeUpdate(req.body || {});
      if (errors.length) return res.status(400).json({ error: errors.join('; ') });
      if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updatable fields provided' });

      const { data, error } = await supabase
        .from('pricing_tiers')
        .update(updates)
        .eq('tier', tier)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ tier: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin pricing API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
