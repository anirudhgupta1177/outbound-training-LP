import { createClient } from '@supabase/supabase-js';
import { validateCouponAgainstDb } from './validate-coupon.js';
import { CONSULT_PRODUCT, consultQuote } from '../src/constants/consultCall.js';
import { resolveConsultRegion } from './_geo.js';

const VALID_TIERS = new Set(['INDIA', 'SAARC', 'INTERNATIONAL']);

// Look up the canonical price for a tier from Supabase. If the table or row
// is missing, return null and let the caller fall back to the client-provided
// values (preserves backward compatibility with the legacy payload shape).
async function fetchCanonicalTier(tier) {
  if (!VALID_TIERS.has(tier)) return null;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('tier', tier)
      .single();
    if (error || !data) return null;
    return {
      currency: data.currency,
      basePrice: Number(data.base_price),
      gstRate: Number(data.gst_rate),
    };
  } catch (err) {
    console.error('fetchCanonicalTier error:', err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read Razorpay credentials from env ONLY (no hardcoded fallback — a stale
    // hardcoded key_id is what breaks payments after a credential rotation).
    // Accept either RAZORPAY_KEY_ID or the legacy VITE_RAZORPAY_KEY_ID name.
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (server env).');
      return res.status(500).json({
        error: 'Payment gateway is not configured. Please contact support.',
        details: 'Server is missing Razorpay credentials.'
      });
    }

    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        return res.status(400).json({
          error: 'Invalid JSON in request body',
          details: e.message
        });
      }
    }

    let {
      product,        // 'consult-call' for the vault's 1:1 upsell; absent = the course
      country,        // consult only: the browser's own geo guess, used only as a fallback
      tier,           // 'INDIA' | 'SAARC' | 'INTERNATIONAL' — preferred, server looks up canonical price
      basePrice,      // major units, pre-discount, pre-GST (legacy / fallback if tier lookup fails)
      gstRate,        // decimal, e.g. 0.18 for India, 0 otherwise (ignored when tier resolves)
      amount,         // legacy: amount already in smallest currency unit
      currency,
      couponCode,
      receipt
    } = bodyData || {};

    // The 1:1 consultation is priced here and nowhere else: two fixed prices,
    // no coupons, and nothing in the request body can raise or lower them —
    // not even which region applies.
    const isConsult = product === CONSULT_PRODUCT;
    let consultRegion = null;
    if (isConsult) {
      // Region comes from Vercel's edge header, not from the request body —
      // the same resolution /api/consult-quote used to draw the banner, so the
      // buyer is charged the figure they were shown.
      const resolved = resolveConsultRegion(req, country);
      consultRegion = resolved.region;
      console.log('Consult region resolved:', resolved);
      const quote = consultQuote(consultRegion);
      currency = quote.currency;
      basePrice = quote.basePrice;
      gstRate = quote.gstRate;
      couponCode = null; // course coupons must not discount an hour of time
      amount = undefined; // ignore any client-supplied smallest-unit amount
    }

    // When the client sends a tier, the server is the source of truth for
    // basePrice + gstRate + currency. This prevents a tampered client from
    // lowering the charged amount via the basePrice field.
    if (tier && !isConsult) {
      const canonical = await fetchCanonicalTier(tier);
      if (canonical) {
        basePrice = canonical.basePrice;
        gstRate = canonical.gstRate;
        currency = canonical.currency;
      }
    }

    if (!currency || (currency !== 'INR' && currency !== 'USD')) {
      return res.status(400).json({
        error: 'Missing or invalid currency',
        details: 'Currency must be either "INR" or "USD"'
      });
    }

    // Server-side coupon re-validation against Supabase `coupons` table.
    // If the coupon is inactive, expired, or over-limit, we reject here —
    // preventing an admin-disabled coupon from being used via a stale client.
    let validatedCoupon = null;
    if (couponCode) {
      const baseForValidation = typeof basePrice === 'number' ? basePrice : undefined;
      validatedCoupon = await validateCouponAgainstDb({
        code: couponCode,
        currency,
        baseAmount: baseForValidation
      });
      if (!validatedCoupon.valid) {
        return res.status(400).json({
          error: validatedCoupon.error || 'Invalid coupon code',
          code: 'COUPON_INVALID'
        });
      }
    }

    // Determine the final amount in the smallest currency unit.
    // Preferred path: client sends basePrice + gstRate, server recomputes.
    // Legacy path: client sends `amount` already in smallest unit — kept for
    // backward compatibility, but coupon still enforces server-side validity.
    let finalAmountSmallest;

    // Razorpay minimum order amounts (in smallest currency unit)
    const RAZORPAY_MIN = { INR: 100, USD: 100 }; // ₹1.00 / $1.00

    if (typeof basePrice === 'number' && basePrice > 0) {
      const rate = typeof gstRate === 'number' && gstRate >= 0 ? gstRate : 0;
      const discountAmount = validatedCoupon ? validatedCoupon.discountAmount : 0;
      const discountedPrice = Math.max(0, basePrice - discountAmount);
      const gstAmount = Math.round(discountedPrice * rate);
      const totalMajor = discountedPrice + gstAmount;
      finalAmountSmallest = Math.round(totalMajor * 100);

      // Enforce Razorpay minimum so deep-discount coupons don't fail
      const minAmount = RAZORPAY_MIN[currency] || 50;
      if (finalAmountSmallest < minAmount) {
        finalAmountSmallest = minAmount;
      }
    } else if (typeof amount === 'number' && Number.isInteger(amount) && amount > 0) {
      finalAmountSmallest = amount;
    } else {
      return res.status(400).json({
        error: 'Missing or invalid amount',
        details: 'Provide either `basePrice` (major units) or `amount` (smallest unit integer)'
      });
    }

    console.log('=== CREATING RAZORPAY ORDER ===');
    console.log('Amount (smallest):', finalAmountSmallest, 'Currency:', currency, 'Coupon:', couponCode || 'none');

    const orderPayload = {
      amount: finalAmountSmallest,
      currency: currency,
      payment_capture: 1,
      receipt: receipt || `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    if (couponCode) {
      orderPayload.notes = {
        coupon_code: couponCode
      };
    }

    // Tags the payment in the Razorpay dashboard so consultation revenue can be
    // told apart from course revenue without cross-referencing amounts.
    if (isConsult) {
      orderPayload.notes = {
        ...(orderPayload.notes || {}),
        product: CONSULT_PRODUCT,
        region: consultRegion,
      };
    }

    const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    const responseText = await orderResponse.text();
    console.log('Razorpay order creation response status:', orderResponse.status);
    console.log('Razorpay order creation response:', responseText);

    if (!orderResponse.ok) {
      console.error('Failed to create Razorpay order:', {
        status: orderResponse.status,
        response: responseText
      });

      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch (e) {
        errorDetails = { message: responseText };
      }

      return res.status(orderResponse.status).json({
        error: 'Failed to create Razorpay order',
        razorpay_status: orderResponse.status,
        razorpay_error: errorDetails,
        request_info: {
          amount: finalAmountSmallest,
          currency: currency,
          couponCode: couponCode || null
        }
      });
    }

    let orderData;
    try {
      orderData = JSON.parse(responseText);
    } catch (e) {
      console.error('Could not parse Razorpay order response as JSON:', e);
      return res.status(500).json({
        error: 'Failed to parse order creation response',
        details: responseText
      });
    }

    console.log('Order created successfully:', {
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      status: orderData.status
    });

    return res.status(200).json({
      success: true,
      order_id: orderData.id,
      key_id: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      product: isConsult ? CONSULT_PRODUCT : null
    });

  } catch (error) {
    console.error('Error in create-order:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
