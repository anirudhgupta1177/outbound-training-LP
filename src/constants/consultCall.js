// The paid 1:1 consultation upsell that sits in the Offer Vault.
//
// This module is the ONLY place the consultation's price is written down. The
// vault banner imports it to render the price, and the serverless endpoints
// (create-order, consult-purchase) import it to decide what the card is
// actually charged — so the advertised figure and the charged figure cannot
// drift apart.
//
// Keep it plain JS: no JSX, no `import.meta`, no browser globals. Vercel's
// Node runtime executes this file inside the API functions.

/** Entitlement slug written to `user_entitlements` once a member has paid. */
export const CONSULT_SLUG = 'consultation-call';

/** Value of `product` that puts /api/create-order on the consultation path. */
export const CONSULT_PRODUCT = 'consult-call';

export const CONSULT_TITLE = '1 Hour Consultation Call with Anirudh';

/**
 * Default booking calendar — the same link the micro-offer funnel's OTO page
 * sends its 1:1 buyers to. An admin can override it with the "Call booking
 * link" in Portal Settings (portal_settings.booking_url).
 */
export const CONSULT_BOOKING_URL = 'https://cal.com/anirudh-gupta/consulting-call';

/**
 * Two prices, nothing in between: India, and everywhere else. SAARC pays the
 * international price here — unlike the course, this is an hour of Anirudh's
 * time, and that cost doesn't move with the buyer's postcode.
 *
 * `basePrice` is ex-GST. Indian buyers pay 18% on top (₹2,999 -> ₹3,539);
 * international buyers pay the flat $50.
 */
export const CONSULT_PRICES = {
  INDIA:         { region: 'INDIA',         currency: 'INR', basePrice: 2999, gstRate: 0.18 },
  INTERNATIONAL: { region: 'INTERNATIONAL', currency: 'USD', basePrice:   50, gstRate: 0    },
};

/** Anything that isn't India buys at the international price. */
export const consultRegionForCountry = (countryCode) =>
  countryCode === 'IN' ? 'INDIA' : 'INTERNATIONAL';

/** Razorpay charges in the smallest unit (paise / cents). */
export const consultRegionForCurrency = (currency) =>
  currency === 'INR' ? 'INDIA' : 'INTERNATIONAL';

/**
 * Full price breakdown for a region. GST is rounded the same way
 * api/create-order.js rounds it, so the quote the banner shows is the exact
 * amount Razorpay is asked for.
 *
 * @param {'INDIA'|'INTERNATIONAL'} region
 * @returns {{region: string, currency: string, basePrice: number, gstRate: number, gstAmount: number, total: number, totalSmallestUnit: number}}
 */
export function consultQuote(region) {
  const row = CONSULT_PRICES[region] || CONSULT_PRICES.INTERNATIONAL;
  const gstAmount = Math.round(row.basePrice * row.gstRate);
  const total = row.basePrice + gstAmount;
  return { ...row, gstAmount, total, totalSmallestUnit: Math.round(total * 100) };
}

export const consultQuoteForCountry = (countryCode) =>
  consultQuote(consultRegionForCountry(countryCode));
