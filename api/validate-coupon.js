import { createClient } from '@supabase/supabase-js';

// Shared coupon validation against Supabase `coupons` table.
// Used by this public endpoint (for the checkout UI) and by
// `/api/create-order.js` for server-side re-validation.
export async function validateCouponAgainstDb({ code, currency, baseAmount }) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Coupon code is required' };
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { valid: false, error: 'Coupon service not configured' };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const upperCode = code.trim().toUpperCase();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', upperCode)
    .maybeSingle();

  if (error) {
    console.error('Coupon lookup error:', error);
    return { valid: false, error: 'Coupon lookup failed' };
  }

  if (!coupon) {
    return { valid: false, code: upperCode, error: 'Invalid coupon code' };
  }

  if (!coupon.is_active) {
    return { valid: false, code: upperCode, error: 'Coupon is inactive' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { valid: false, code: upperCode, error: 'Coupon has expired' };
  }

  if (
    coupon.max_redemptions !== null &&
    coupon.max_redemptions !== undefined &&
    coupon.redemption_count >= coupon.max_redemptions
  ) {
    return { valid: false, code: upperCode, error: 'Coupon usage limit reached' };
  }

  // Compute discount
  let discountPercent = 0;
  let discountAmount = 0;

  if (coupon.discount_type === 'percent') {
    discountPercent = Number(coupon.discount_value);
    if (typeof baseAmount === 'number' && baseAmount > 0) {
      discountAmount = Math.round((baseAmount * discountPercent) / 100);
    }
  } else if (coupon.discount_type === 'fixed') {
    if (currency && coupon.currency && coupon.currency !== currency) {
      return {
        valid: false,
        code: upperCode,
        error: `Coupon only valid for ${coupon.currency}`
      };
    }
    discountAmount = Number(coupon.discount_value);
    if (typeof baseAmount === 'number' && baseAmount > 0) {
      discountAmount = Math.min(discountAmount, baseAmount);
      discountPercent = Math.round((discountAmount / baseAmount) * 10000) / 100;
    }
  }

  return {
    valid: true,
    code: upperCode,
    discount: discountPercent, // legacy field: percent value, for UI compatibility
    discountType: coupon.discount_type,
    discountValue: Number(coupon.discount_value),
    discountPercent,
    discountAmount,
    currency: coupon.currency || null
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  let bodyData = req.body;
  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch (e) {
      return res.status(400).json({ valid: false, error: 'Invalid JSON body' });
    }
  }

  const { code, currency, baseAmount } = bodyData || {};

  try {
    const result = await validateCouponAgainstDb({ code, currency, baseAmount });
    return res.status(200).json(result);
  } catch (err) {
    console.error('validate-coupon error:', err);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
