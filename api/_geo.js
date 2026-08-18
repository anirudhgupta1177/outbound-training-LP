import { consultRegionForCountry } from '../src/constants/consultCall.js';

// Where the consultation's region comes from.
//
// The browser's own detection (src/services/geolocation.js) calls two
// third-party IP APIs and falls back to 'IN' when both fail — which ad blockers
// and daily rate limits make a routine outcome, not an edge case. Left alone,
// that hands an international buyer the ₹ price.
//
// Vercel stamps every request with the country it saw at the edge, which needs
// no third party and cannot be rate-limited. Both the quote endpoint and the
// order endpoint resolve through here, so the price on the banner and the price
// on the card are always derived the same way and cannot disagree.

/** Vercel's edge geo header. Absent locally and on non-Vercel hosts. */
export const EDGE_COUNTRY_HEADER = 'x-vercel-ip-country';

/**
 * @param {object} req                 the serverless request
 * @param {string|null} clientCountry  the browser's own guess, used only as a fallback
 * @returns {{region: 'INDIA'|'INTERNATIONAL', country: string|null, source: string}}
 */
export function resolveConsultRegion(req, clientCountry = null) {
  const edgeCountry = (req.headers?.[EDGE_COUNTRY_HEADER] || '').toUpperCase() || null;

  // Outside production, an explicit country is honoured so the $50 path can be
  // exercised without a VPN. In production it is ignored — otherwise the client
  // would be choosing its own price.
  const isProduction = process.env.VERCEL_ENV === 'production';
  if (!isProduction && clientCountry) {
    return {
      region: consultRegionForCountry(clientCountry.toUpperCase()),
      country: clientCountry.toUpperCase(),
      source: 'override',
    };
  }

  if (edgeCountry) {
    return { region: consultRegionForCountry(edgeCountry), country: edgeCountry, source: 'edge' };
  }

  // No edge header (local dev, self-hosted). Trust the browser rather than
  // charging everyone the same currency.
  if (clientCountry) {
    return {
      region: consultRegionForCountry(clientCountry.toUpperCase()),
      country: clientCountry.toUpperCase(),
      source: 'client',
    };
  }

  return { region: 'INTERNATIONAL', country: null, source: 'default' };
}
