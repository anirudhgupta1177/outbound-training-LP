import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  CONSULT_PRODUCT,
  CONSULT_SLUG,
  CONSULT_BOOKING_URL,
  CONSULT_TITLE,
  consultQuote,
  consultRegionForCurrency,
} from '../src/constants/consultCall.js';

// Fulfilment for the vault's 1:1 consultation upsell.
//
// The buyer is already a signed-in member, so this is deliberately much smaller
// than /api/create-contact: no account to create, no course to enrol in. It
// verifies the payment really happened, records the order, and grants the
// entitlement that turns the vault banner into a booking link.
//
// Nothing here trusts the caller about money. The amount is re-derived from
// this repo's own price table and checked against what Razorpay says was
// captured, so a replayed or hand-rolled request cannot buy a call for ₹1.

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Constant-time compare that tolerates different-length inputs. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('consult-purchase: Razorpay credentials missing.');
    return res.status(500).json({ error: 'Payment gateway is not configured.' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('consult-purchase: Supabase credentials missing.');
    return res.status(500).json({ error: 'Portal is not configured.' });
  }

  let bodyData = req.body;
  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in request body', details: e.message });
    }
  }

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    // Invoice details only. A GSTIN never changes the amount — the 18% is
    // charged to every Indian buyer either way — so a malformed one is dropped
    // rather than being allowed to fail a payment that already went through.
    gstin,
    business_name: businessName,
    business_state: businessState,
    business_state_code: businessStateCode,
  } = bodyData || {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      error: 'Missing payment details',
      details: 'razorpay_payment_id, razorpay_order_id and razorpay_signature are all required',
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // ---- 1. Who is asking? The banner only renders to signed-in members, and
    // the entitlement has to land on a real account, so anonymous is a 401.
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Sign in required' });
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(authHeader.substring(7));
    const user = authData?.user;
    if (authError || !user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    // ---- 2. Signature. This is what binds the payment id to the order id we
    // issued; without it a caller could pair any two ids they liked.
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeEqual(expectedSignature, razorpay_signature)) {
      console.error('consult-purchase: signature mismatch for', razorpay_payment_id);
      return res.status(400).json({ error: 'Payment could not be verified' });
    }

    // ---- 3. Ask Razorpay what actually happened. A valid signature proves the
    // ids came from us; only the API proves the money moved.
    const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: `Basic ${razorpayAuth}` },
    });

    if (!paymentRes.ok) {
      console.error('consult-purchase: payment lookup failed', paymentRes.status);
      return res.status(502).json({ error: 'Could not verify the payment with Razorpay' });
    }

    const payment = await paymentRes.json();

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured', status: payment.status });
    }
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Payment does not belong to that order' });
    }

    // ---- 4. Was enough paid, for this product? The expected total is rebuilt
    // from our own price table using the currency Razorpay reports, so a
    // client claiming to be in India cannot pay ₹2,999 for the $50 call.
    const region = consultRegionForCurrency(payment.currency);
    const quote = consultQuote(region);

    if (payment.currency !== quote.currency || payment.amount < quote.totalSmallestUnit) {
      console.error('consult-purchase: amount/currency mismatch', {
        paid: payment.amount,
        currency: payment.currency,
        expected: quote.totalSmallestUnit,
      });
      return res.status(400).json({ error: 'Payment amount does not match the consultation price' });
    }

    // ---- 5. Bind the payment to THIS product. Amount alone is not enough: the
    // course costs more than the call, and a member can read their own
    // razorpay_signature straight out of their browser — so without this, a
    // course receipt could be replayed here to claim a free consultation.
    // Every consultation order is tagged by /api/create-order, so the tag has
    // to be present, not merely non-contradictory.
    let orderVerified = false;
    try {
      const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
        headers: { Authorization: `Basic ${razorpayAuth}` },
      });
      if (orderRes.ok) {
        const order = await orderRes.json();
        if (order?.notes?.product !== CONSULT_PRODUCT) {
          return res.status(400).json({ error: 'That payment was not for the consultation call' });
        }
        orderVerified = true;
      } else {
        console.warn('consult-purchase: order lookup returned', orderRes.status);
      }
    } catch (err) {
      console.warn('consult-purchase: order lookup failed:', err.message);
    }

    // ---- 6. Replay guard. One payment unlocks one account; a second member
    // pasting the same ids gets nothing.
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle();

    if (existingOrder && existingOrder.user_id && existingOrder.user_id !== user.id) {
      console.error('consult-purchase: payment already claimed by another user', razorpay_payment_id);
      return res.status(409).json({ error: 'That payment has already been used' });
    }

    // Razorpay wouldn't say what the order was for. Rather than wave the
    // payment through, fall back to the strictest test available without it:
    // an exactly-priced payment we have never recorded before. A replayed
    // course receipt fails both halves; a genuine call purchase passes both.
    if (!orderVerified && (payment.amount !== quote.totalSmallestUnit || existingOrder)) {
      console.error('consult-purchase: unverified order failed the strict fallback', razorpay_payment_id);
      return res.status(400).json({
        error: "We couldn't confirm that payment was for the consultation call. Please contact support with your payment ID.",
      });
    }

    // ---- 7. Grant access. This is the step that matters to the buyer: it is
    // what swaps the banner's pay button for the booking link.
    const { error: entitlementError } = await supabase
      .from('user_entitlements')
      .upsert(
        {
          user_id: user.id,
          offer_slug: CONSULT_SLUG,
          source: 'purchase',
          granted_by: razorpay_payment_id,
        },
        { onConflict: 'user_id,offer_slug' }
      );

    if (entitlementError) {
      console.error('consult-purchase: failed to grant entitlement:', entitlementError);
      return res.status(500).json({
        error: 'Payment succeeded but access could not be granted. Our team has been notified.',
      });
    }

    // ---- 8. Record the order. Non-blocking: the member has paid and has
    // access, and bookkeeping must never be what fails their purchase.
    if (!existingOrder) {
      const metadata = user.user_metadata || {};
      const customerName =
        [metadata.first_name, metadata.last_name].filter(Boolean).join(' ').trim() ||
        payment.notes?.name ||
        null;

      const cleanGstin = typeof gstin === 'string' ? gstin.trim().toUpperCase() : '';
      const hasGst = region === 'INDIA' && GSTIN_REGEX.test(cleanGstin);
      if (cleanGstin && !hasGst) {
        console.warn('consult-purchase: ignoring malformed GSTIN on', razorpay_payment_id);
      }

      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        razorpay_payment_id,
        razorpay_order_id,
        product: CONSULT_PRODUCT,
        amount: payment.amount,
        // The exact split we charged, in the same smallest-unit convention as
        // `amount`. Storing it stops the invoice generator having to divide the
        // gross back out, which never lands on the advertised price.
        base_amount: Math.round(quote.basePrice * 100),
        gst_amount: Math.round(quote.gstAmount * 100),
        currency: payment.currency,
        region,
        customer_email: user.email,
        customer_name: customerName,
        has_gst: hasGst,
        gstin: hasGst ? cleanGstin : null,
        business_name: hasGst && businessName ? String(businessName).trim() : null,
        business_state: hasGst && businessState ? String(businessState).trim() : null,
        business_state_code: hasGst && businessStateCode ? String(businessStateCode).trim() : null,
      });

      if (orderError && !orderError.message.includes('duplicate')) {
        console.error('consult-purchase: failed to store order:', orderError);
      }
    }

    // ---- 9. Hand back the calendar. Admin's Portal Settings link wins; the
    // funnel's OTO calendar is the default.
    const { data: settings } = await supabase
      .from('portal_settings')
      .select('booking_url')
      .eq('id', 'default')
      .maybeSingle();

    console.log('consult-purchase: granted', CONSULT_SLUG, 'to', user.id, 'via', razorpay_payment_id);

    return res.status(200).json({
      success: true,
      offer_slug: CONSULT_SLUG,
      title: CONSULT_TITLE,
      booking_url: settings?.booking_url || CONSULT_BOOKING_URL,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error('consult-purchase error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
