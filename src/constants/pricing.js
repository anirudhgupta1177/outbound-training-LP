export const PRICING = {
  INDIA: {
    currency: 'INR',
    symbol: '₹',
    basePrice: 3497,
    gstRate: 0.18,
    originalPrice: 43999,
    displayPrice: '₹3,497',
    displayOriginalPrice: '₹43,999'
  },
  INTERNATIONAL: {
    currency: 'USD',
    symbol: '$',
    basePrice: 97,
    gstRate: 0, // No GST for international
    originalPrice: 99,
    displayPrice: '$97',
    displayOriginalPrice: '$99'
  }
};

/**
 * Get pricing configuration based on country code
 * @param {string} countryCode - ISO country code (e.g., 'IN' for India)
 * @returns {Object} Pricing configuration object
 */
export const getPricingByCountry = (countryCode) => {
  return countryCode === 'IN' ? PRICING.INDIA : PRICING.INTERNATIONAL;
};

/**
 * Format price with currency symbol
 * @param {number} amount - Price amount
 * @param {string} currency - Currency code (INR or USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, currency) => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  } else {
    return `$${amount.toLocaleString('en-US')}`;
  }
};

