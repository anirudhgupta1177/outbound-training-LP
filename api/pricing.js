import { createClient } from '@supabase/supabase-js';

// Public, unauthenticated read of all pricing tiers. The frontend caches this
// for the lifetime of the page; we also send a short edge cache header so
// repeat visits don't hit Supabase. If the table is missing or the request
// fails, we return a 200 with `tiers: null` so the client falls back to its
// static defaults instead of breaking the page.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ tiers: null, source: 'fallback' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.from('pricing_tiers').select('*');
    if (error) throw error;

    const tiers = {};
    for (const row of data || []) {
      tiers[row.tier] = {
        tier: row.tier,
        currency: row.currency,
        symbol: row.symbol,
        basePrice: Number(row.base_price),
        originalPrice: Number(row.original_price),
        gstRate: Number(row.gst_rate),
      };
    }

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ tiers, source: 'db' });
  } catch (err) {
    console.error('Pricing API error:', err);
    return res.status(200).json({ tiers: null, source: 'fallback', error: err.message });
  }
}
