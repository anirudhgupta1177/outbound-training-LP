// Coupons are now managed in Supabase via the admin portal (/admin/coupons).
// This module is a thin client that calls the /api/validate-coupon endpoint.
// The default coupon code is kept here so it can be auto-applied on checkout
// without requiring an unauthenticated list endpoint.

export const DEFAULT_COUPON = 'SPECIAL5';

/**
 * Validate a coupon code against the server-side Supabase store.
 *
 * @param {Object} params
 * @param {string} params.code        - coupon code entered by the user
 * @param {string} params.currency    - 'INR' or 'USD'
 * @param {number} [params.baseAmount] - pre-discount price in major units
 * @returns {Promise<{
 *   valid: boolean,
 *   code: string,
 *   discount?: number,       // percent equivalent, for UI compatibility
 *   discountPercent?: number,
 *   discountAmount?: number,
 *   discountType?: 'percent' | 'fixed',
 *   currency?: string | null,
 *   error?: string
 * }>}
 */
export async function validateCoupon({ code, currency, baseAmount } = {}) {
  if (!code || typeof code !== 'string') {
    return { valid: false, code: '', error: 'Coupon code is required' };
  }

  try {
    const response = await fetch('/api/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        currency,
        baseAmount
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        valid: false,
        code: code.trim().toUpperCase(),
        error: data.error || 'Failed to validate coupon'
      };
    }

    return data;
  } catch (err) {
    console.error('Coupon validation error:', err);
    return {
      valid: false,
      code: code.trim().toUpperCase(),
      error: 'Network error while validating coupon'
    };
  }
}
