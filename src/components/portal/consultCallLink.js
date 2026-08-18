import { useOffers } from '../../contexts/OffersContext';
import { CONSULT_BOOKING_URL, CONSULT_SLUG } from '../../constants/consultCall';

/** Anchor on the vault's consultation banner, so a link can land right on it. */
export const CONSULT_ANCHOR_ID = 'consultation-call';

/**
 * Where a "book a call with an expert" prompt outside the vault should point.
 *
 * The calendar itself is only handed to members who have paid — Cal.com has no
 * idea what a booking costs, so a bare link to it anywhere in the portal is a
 * free 1:1 session. Everyone else is sent to the vault banner, which is the one
 * place that takes payment.
 *
 * @returns {{href: string, external: boolean, purchased: boolean, label: string}}
 */
export function useConsultCallLink() {
  const { entitlements, settings } = useOffers();
  const purchased = entitlements.includes(CONSULT_SLUG);

  if (purchased) {
    return {
      href: settings.booking_url || CONSULT_BOOKING_URL,
      external: true,
      purchased: true,
      label: 'Book your call',
    };
  }

  return {
    href: `/portal#${CONSULT_ANCHOR_ID}`,
    external: false,
    purchased: false,
    label: 'Book a 1:1 with Anirudh',
  };
}
