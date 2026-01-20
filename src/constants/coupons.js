// Hard-coded coupon codes and their discount percentages
export const coupons = {
  'ALLBOUND': 20,  // 20% discount
  'TESTSARANSH': 99.97,  // 99.97% discount (Testing only - pays ~₹1)
  'SPECIAL5': 5,  // 5% discount - Default coupon applied on checkout
  // Add more coupons here as needed
};

// Default coupon to auto-apply on checkout page
export const DEFAULT_COUPON = 'SPECIAL5';

/**
 * Validates a coupon code and returns discount information
 * @param {string} code - The coupon code to validate (case-insensitive)
 * @returns {Object} - { valid: boolean, discount: number, code: string }
 */
export const validateCoupon = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, discount: 0, code: '' };
  }

  const upperCode = code.trim().toUpperCase();
  
  if (coupons[upperCode]) {
    return {
      valid: true,
      discount: coupons[upperCode],
      code: upperCode
    };
  }

  return { valid: false, discount: 0, code: upperCode };
};

