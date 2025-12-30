// Hard-coded coupon codes and their discount percentages
export const coupons = {
  'ALLBOUND': 40,  // 40% discount
  // Add more coupons here as needed
};

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

