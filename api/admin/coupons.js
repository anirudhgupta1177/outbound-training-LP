import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

const VALID_TYPES = new Set(['percent', 'fixed']);
const VALID_CURRENCIES = new Set(['INR', 'USD']);

function sanitizeCreatePayload(body) {
  const errors = [];
  const payload = {};

  const rawCode = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!rawCode) errors.push('Code is required');
  else if (!/^[A-Z0-9_\-]+$/.test(rawCode)) errors.push('Code may only contain letters, numbers, underscore and dash');
  else payload.code = rawCode;

  const discount_type = body.discount_type;
  if (!VALID_TYPES.has(discount_type)) errors.push('discount_type must be "percent" or "fixed"');
  else payload.discount_type = discount_type;

  const discount_value = Number(body.discount_value);
  if (!Number.isFinite(discount_value) || discount_value <= 0) {
    errors.push('discount_value must be a positive number');
  } else if (discount_type === 'percent' && discount_value > 100) {
    errors.push('Percent discount cannot exceed 100');
  } else {
    payload.discount_value = discount_value;
  }

  if (discount_type === 'fixed') {
    if (!VALID_CURRENCIES.has(body.currency)) {
      errors.push('currency is required for fixed-amount coupons ("INR" or "USD")');
    } else {
      payload.currency = body.currency;
    }
  } else {
    payload.currency = null;
  }

  if (body.max_redemptions === '' || body.max_redemptions === null || body.max_redemptions === undefined) {
    payload.max_redemptions = null;
  } else {
    const maxR = Number(body.max_redemptions);
    if (!Number.isInteger(maxR) || maxR <= 0) errors.push('max_redemptions must be a positive integer or empty');
    else payload.max_redemptions = maxR;
  }

  if (!body.expires_at) {
    payload.expires_at = null;
  } else {
    const d = new Date(body.expires_at);
    if (Number.isNaN(d.getTime())) errors.push('expires_at must be a valid date');
    else payload.expires_at = d.toISOString();
  }

  payload.is_active = body.is_active === undefined ? true : Boolean(body.is_active);
  payload.description = typeof body.description === 'string' ? body.description.trim() || null : null;

  return { payload, errors };
}

function sanitizeUpdatePayload(body) {
  const errors = [];
  const updates = {};

  // code is immutable on update

  if (body.discount_type !== undefined) {
    if (!VALID_TYPES.has(body.discount_type)) errors.push('discount_type must be "percent" or "fixed"');
    else updates.discount_type = body.discount_type;
  }

  if (body.discount_value !== undefined) {
    const v = Number(body.discount_value);
    if (!Number.isFinite(v) || v <= 0) errors.push('discount_value must be a positive number');
    else updates.discount_value = v;
  }

  if (body.currency !== undefined) {
    if (body.currency === null || body.currency === '') {
      updates.currency = null;
    } else if (!VALID_CURRENCIES.has(body.currency)) {
      errors.push('currency must be INR, USD, or empty');
    } else {
      updates.currency = body.currency;
    }
  }

  if (body.max_redemptions !== undefined) {
    if (body.max_redemptions === '' || body.max_redemptions === null) {
      updates.max_redemptions = null;
    } else {
      const maxR = Number(body.max_redemptions);
      if (!Number.isInteger(maxR) || maxR <= 0) errors.push('max_redemptions must be a positive integer or null');
      else updates.max_redemptions = maxR;
    }
  }

  if (body.expires_at !== undefined) {
    if (!body.expires_at) {
      updates.expires_at = null;
    } else {
      const d = new Date(body.expires_at);
      if (Number.isNaN(d.getTime())) errors.push('expires_at must be a valid date');
      else updates.expires_at = d.toISOString();
    }
  }

  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
  if (body.description !== undefined) updates.description = typeof body.description === 'string' ? body.description.trim() || null : null;

  return { updates, errors };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authResult = verifyAdminToken(req.headers.authorization, JWT_SECRET);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return res.status(200).json({ coupon });
      }
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ coupons });
    }

    if (req.method === 'POST') {
      const { payload, errors } = sanitizeCreatePayload(req.body || {});
      if (errors.length) return res.status(400).json({ error: errors.join('; ') });

      const { data: coupon, error } = await supabase
        .from('coupons')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || (error.message || '').includes('duplicate')) {
          return res.status(409).json({ error: 'A coupon with this code already exists' });
        }
        throw error;
      }
      return res.status(201).json({ coupon });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Coupon ID is required' });

      const { updates, errors } = sanitizeUpdatePayload(req.body || {});
      if (errors.length) return res.status(400).json({ error: errors.join('; ') });
      if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updatable fields provided' });

      const { data: coupon, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ coupon });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Coupon ID is required' });
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Coupons API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
