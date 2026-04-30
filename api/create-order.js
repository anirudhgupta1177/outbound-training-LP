import { validateCouponAgainstDb } from './validate-coupon.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';

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

    const {
      basePrice,      // major units, pre-discount, pre-GST (preferred new field)
      gstRate,        // decimal, e.g. 0.18 for India, 0 otherwise
      amount,         // legacy: amount already in smallest currency unit
      currency,
      couponCode,
      receipt
    } = bodyData || {};

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
      currency: orderData.currency
    });

  } catch (error) {
    console.error('Error in create-order:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
