// SAARC countries that get regional pricing (same affordability as India)
export const SAARC_COUNTRIES = ['BD', 'PK', 'NP', 'LK', 'BT']; // Bangladesh, Pakistan, Nepal, Sri Lanka, Bhutan

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
  SAARC: {
    currency: 'USD',
    symbol: '$',
    basePrice: 47,
    gstRate: 0, // No GST for SAARC
    originalPrice: 1499, // Similar discount ratio (~97% off)
    displayPrice: '$47',
    displayOriginalPrice: '$1,499'
  },
  INTERNATIONAL: {
    currency: 'USD',
    symbol: '$',
    basePrice: 97,
    gstRate: 0, // No GST for international
    originalPrice: 2999, // Similar ratio to India: ₹43,999 → ₹3,497 (92% discount)
    displayPrice: '$97',
    displayOriginalPrice: '$2,999'
  }
};

/**
 * Get pricing configuration based on country code
 * @param {string} countryCode - ISO country code (e.g., 'IN' for India)
 * @returns {Object} Pricing configuration object (new object each time to ensure React detects changes)
 */
export const getPricingByCountry = (countryCode) => {
  // Return a new object each time to ensure React detects state changes
  let source;
  if (countryCode === 'IN') {
    source = PRICING.INDIA;
  } else if (SAARC_COUNTRIES.includes(countryCode)) {
    source = PRICING.SAARC;
  } else {
    source = PRICING.INTERNATIONAL;
  }
  return { ...source }; // Spread to create new object reference
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

/**
 * Convert INR amounts to USD (approximate conversion rate 1 USD = 83 INR)
 * @param {number} inrAmount - Amount in INR
 * @returns {number} Amount in USD (rounded)
 */
export const convertINRToUSD = (inrAmount) => {
  return Math.round(inrAmount / 83);
};

/**
 * Format large amounts (like Cr/lakhs for INR, millions for USD)
 * @param {number} amount - Amount in base currency
 * @param {string} currency - Currency code (INR or USD)
 * @returns {string} Formatted string (e.g., "₹4.2 Cr" or "$500K")
 */
export const formatLargeAmount = (amount, currency) => {
  if (currency === 'INR') {
    if (amount >= 10000000) { // 1 Crore or more
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) { // 1 Lakh or more
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return formatPrice(amount, currency);
  } else {
    if (amount >= 1000000) { // 1 Million or more
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) { // 1K or more
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return formatPrice(amount, currency);
  }
};

