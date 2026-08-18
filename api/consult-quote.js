import { resolveConsultRegion } from './_geo.js';
import { consultQuote } from '../src/constants/consultCall.js';

// The price the vault banner displays.
//
// It exists so the banner never prices itself from browser-side geolocation:
// /api/create-order resolves the region through the same helper, so whatever
// this returns is what the card is charged. Public on purpose — it is a price
// list, and it reveals nothing a buyer can't see on the banner.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientCountry = typeof req.query?.country === 'string' ? req.query.country : null;
  const { region, country, source } = resolveConsultRegion(req, clientCountry);
  const quote = consultQuote(region);

  // Prices move rarely, but a stale currency is worse than an extra request.
  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).json({
    region,
    country,
    source,
    currency: quote.currency,
    basePrice: quote.basePrice,
    gstRate: quote.gstRate,
    gstAmount: quote.gstAmount,
    total: quote.total,
  });
}
