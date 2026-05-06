// SAARC countries that get regional pricing (same affordability as India)
export const SAARC_COUNTRIES = ['BD', 'PK', 'NP', 'LK', 'BT']; // Bangladesh, Pakistan, Nepal, Sri Lanka, Bhutan

export const TIER_KEYS = ['INDIA', 'SAARC', 'INTERNATIONAL'];

// Static fallback used when /api/pricing is unreachable. Admins should keep
// these aligned with the seeded `pricing_tiers` rows in supabase/pricing-schema.sql,
// but the DB is the source of truth at runtime.
export const FALLBACK_TIERS = {
  INDIA:         { tier: 'INDIA',         currency: 'INR', symbol: '₹', basePrice: 3999, originalPrice: 49999, gstRate: 0.18 },
  SAARC:         { tier: 'SAARC',         currency: 'USD', symbol: '$', basePrice:   47, originalPrice:  1499, gstRate: 0    },
  INTERNATIONAL: { tier: 'INTERNATIONAL', currency: 'USD', symbol: '$', basePrice:  129, originalPrice:  3999, gstRate: 0    },
};

/**
 * Map an ISO country code to one of our three tier keys.
 * @param {string} countryCode
 * @returns {'INDIA' | 'SAARC' | 'INTERNATIONAL'}
 */
export const tierForCountry = (countryCode) => {
  if (countryCode === 'IN') return 'INDIA';
  if (SAARC_COUNTRIES.includes(countryCode)) return 'SAARC';
  return 'INTERNATIONAL';
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (amount, currency) => {
  if (currency === 'INR') {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }
  return `$${Number(amount).toLocaleString('en-US')}`;
};

/**
 * Build a fully-formed pricing object (with displayPrice / displayOriginalPrice)
 * from raw numeric fields. Used by both the static fallback path and the DB path.
 */
export const buildPricing = ({ tier, currency, symbol, basePrice, originalPrice, gstRate }) => ({
  tier,
  currency,
  symbol,
  basePrice: Number(basePrice),
  originalPrice: Number(originalPrice),
  gstRate: Number(gstRate) || 0,
  displayPrice: formatPrice(basePrice, currency),
  displayOriginalPrice: formatPrice(originalPrice, currency),
});

/**
 * Resolve pricing for a country code from a tiers map (DB rows or fallback).
 * Always returns a fresh object so React detects state changes.
 *
 * @param {string} countryCode
 * @param {Object} [tiersMap] - keyed by tier name; defaults to FALLBACK_TIERS
 * @returns {Object} pricing config
 */
export const getPricingByCountry = (countryCode, tiersMap = FALLBACK_TIERS) => {
  const key = tierForCountry(countryCode);
  const source = tiersMap[key] || FALLBACK_TIERS[key] || FALLBACK_TIERS.INTERNATIONAL;
  return buildPricing(source);
};

// Back-compat: a few older callers still import PRICING.<TIER>. Keep the shape
// they expect (with displayPrice / displayOriginalPrice baked in).
export const PRICING = {
  INDIA:         buildPricing(FALLBACK_TIERS.INDIA),
  SAARC:         buildPricing(FALLBACK_TIERS.SAARC),
  INTERNATIONAL: buildPricing(FALLBACK_TIERS.INTERNATIONAL),
};

/**
 * Convert INR amounts to USD (approximate conversion rate 1 USD = 83 INR)
 */
export const convertINRToUSD = (inrAmount) => {
  return Math.round(inrAmount / 83);
};

/**
 * Format large amounts (Cr/Lakh for INR, M/K for USD)
 */
export const formatLargeAmount = (amount, currency) => {
  if (currency === 'INR') {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)} L`;
    return formatPrice(amount, currency);
  }
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000)    return `$${(amount / 1000).toFixed(0)}K`;
  return formatPrice(amount, currency);
};
