import crypto from 'crypto';

// Stamped on every course order by create-order.js, so create-contact can tell
// a course purchase apart from the consult call, the /micro funnel and payment
// links, which all charge through the same Razorpay account.
export const COURSE_PRODUCT = 'outbound-mastery';

// Course orders created before the marker shipped carry no `product` note.
// They are accepted until this cutoff (unix seconds) so a buyer who was
// mid-checkout during the deploy still gets their account; after it, an
// unmarked order is never a course order.
const UNMARKED_ORDER_CUTOFF = Date.UTC(2026, 9, 8, 0, 0, 0) / 1000;

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const fail = (status, error) => ({ ok: false, status, error });

/**
 * Prove that a payment really bought the course, before any account, order or
 * email is created for it. Fails closed: if Razorpay can't be reached, nothing
 * is granted.
 *
 * @returns {Promise<{ok:true, amount:number, currency:string, couponCode:string|null}
 *                  | {ok:false, status:number, error:string}>}
 */
export async function verifyCoursePayment({ paymentId, orderId, signature, keyId, keySecret }) {
  if (!keyId || !keySecret) return fail(500, 'Payment gateway is not configured.');
  if (!paymentId || !orderId || !signature) {
    return fail(400, 'razorpay_payment_id, razorpay_order_id and razorpay_signature are all required');
  }

  // 1. Razorpay signs `${order_id}|${payment_id}` only on a successful checkout.
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  if (!safeEqual(expected, signature)) return fail(400, 'Payment signature verification failed');

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const get = async (path) => {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.ok ? response.json() : null;
  };

  let payment;
  let order;
  try {
    [payment, order] = await Promise.all([
      get(`payments/${encodeURIComponent(paymentId)}`),
      get(`orders/${encodeURIComponent(orderId)}`),
    ]);
  } catch (err) {
    console.error('verifyCoursePayment: Razorpay lookup threw', err);
    return fail(502, 'Could not verify the payment with Razorpay');
  }
  if (!payment || !order) return fail(502, 'Could not verify the payment with Razorpay');

  // 2. The money actually arrived, against this order.
  if (payment.order_id !== orderId) return fail(400, 'Payment does not belong to this order');
  if (payment.status !== 'captured') {
    return fail(400, 'Payment must be captured before granting course access.');
  }

  // 3. The order was for the course. Razorpay returns empty notes as [].
  const notes = !Array.isArray(order.notes) && order.notes ? order.notes : {};
  if (notes.product !== COURSE_PRODUCT) {
    const looksLikeOldCourseOrder =
      !notes.product && Object.keys(notes).every((key) => key === 'coupon_code');
    if (!looksLikeOldCourseOrder || !(order.created_at < UNMARKED_ORDER_CUTOFF)) {
      console.warn('verifyCoursePayment: not a course order', orderId, notes.product || Object.keys(notes));
      return fail(403, 'This payment was not for the course');
    }
  }

  return {
    ok: true,
    amount: payment.amount,
    currency: payment.currency,
    couponCode: notes.coupon_code || null,
  };
}
