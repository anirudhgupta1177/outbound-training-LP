// Reads the Offer Vault. /api/offers decides what the caller is allowed to see,
// so this only forwards the member's Supabase access token and normalises the
// shape the UI consumes.
import { supabase } from '../lib/supabase';

export const OFFER_SLUGS = {
  microCourse: 'outbound-micro-course',
  mastery: 'outbound-mastery',
  expertCall: 'expert-call',
};

const EMPTY = {
  offers: [],
  entitlements: [],
  settings: { booking_url: null, vault_heading: 'Your Offer Vault', vault_subheading: '' },
};

export async function fetchOffers() {
  let accessToken = null;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token || null;
  } catch {
    accessToken = null;
  }

  const response = await fetch('/api/offers', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new Error('Failed to load offers');
  }

  const data = await response.json();

  return {
    offers: (data.offers || []).map((offer) => ({
      ...offer,
      highlights: offer.highlights || [],
      resources: offer.resources || [],
    })),
    entitlements: data.entitlements || [],
    settings: { ...EMPTY.settings, ...(data.settings || {}) },
  };
}

export { EMPTY as emptyOffersState };
