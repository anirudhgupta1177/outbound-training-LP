-- Paid 1:1 consultation upsell in the Offer Vault.
--
-- The banner itself lives in code (src/components/portal/ConsultCallBanner.jsx)
-- because its price and Razorpay checkout are code, not admin config. The only
-- thing the database has to do is (a) stop showing the old free call upsell and
-- (b) hold the entitlement each buyer earns.
--
-- Run this in the Supabase SQL Editor.

-- 1. Retire the free "Book a Meeting With an Expert" banner. A free call and a
--    ₹2,999 call cannot sit in the same vault. Deactivated rather than deleted
--    so it can be brought back with a single UPDATE if that decision changes.
--    (OfferVault.jsx also filters consult-kind rows out, so re-activating this
--    alone will not re-render it.)
UPDATE public.portal_offers
   SET is_active = false,
       updated_at = now()
 WHERE slug = 'expert-call';

-- 2. Point the vault's booking calendar at the same link the micro-offer
--    funnel's OTO page uses. Leaving booking_url NULL is fine — the code falls
--    back to this exact URL — but setting it makes the link editable from the
--    admin portal without a deploy.
INSERT INTO public.portal_settings (id, booking_url)
VALUES ('default', 'https://cal.com/anirudh-gupta/consulting-call')
ON CONFLICT (id) DO UPDATE
   SET booking_url = COALESCE(public.portal_settings.booking_url, EXCLUDED.booking_url),
       updated_at  = now();

-- 3. Register the consultation as an offer row.
--
--    The vault does NOT render this row — the banner is code, and OfferVault
--    filters consult-kind rows out of the card grid. The row exists so the offer
--    has a handle in the admin: without it the Members page has no toggle for
--    'consultation-call', and support's only way to grant a call after a failed
--    fulfilment (or revoke one after a refund) is raw SQL.
--
--    unlocked_by_default MUST stay false. It is what marks the offer as paid,
--    and MembersPage uses it to decide the toggle is worth showing.
--
--    ⚠️  Deleting this row from the admin also deletes every
--    'consultation-call' entitlement — api/admin/offers.js cleans up
--    entitlements by slug on delete. Deactivate it instead of deleting it.
INSERT INTO public.portal_offers (
  slug, title, subtitle, description, kind, badge,
  duration_label, cta_label, accent, unlocked_by_default, is_active, order_index
)
VALUES (
  'consultation-call',
  '1 Hour Consultation Call with Anirudh',
  'A focused 60-minute working session — together on Zoom',
  'Paid 1:1 session. Sold by the vault banner (₹2,999 + GST in India, $50 elsewhere); booking opens once the member has paid.',
  'consult',
  '1:1 WITH ANIRUDH',
  '60 minutes',
  'Book Your Call',
  'purple',
  false,
  true,
  90
)
ON CONFLICT (slug) DO UPDATE
   SET kind                = 'consult',
       unlocked_by_default = false,
       is_active           = true,
       updated_at          = now();

-- 4. A paid consultation is otherwise just an entitlement row.
--    /api/consult-purchase writes this after verifying the Razorpay payment:
--
--      INSERT INTO public.user_entitlements (user_id, offer_slug, source, granted_by)
--      VALUES (<buyer>, 'consultation-call', 'purchase', <razorpay_payment_id>);

-- Prefer the admin Members page for the two operations below; the SQL is here
-- for when the portal itself is the thing that is broken.

-- Grant a call manually (comps, a payment that failed to record):
--   INSERT INTO public.user_entitlements (user_id, offer_slug, source, granted_by)
--   SELECT id, 'consultation-call', 'admin', 'support'
--     FROM auth.users WHERE email = 'member@example.com'
--   ON CONFLICT (user_id, offer_slug) DO NOTHING;

-- Revoke one:
--   DELETE FROM public.user_entitlements
--    WHERE offer_slug = 'consultation-call'
--      AND user_id = (SELECT id FROM auth.users WHERE email = 'member@example.com');

-- Who has bought a call:
--   SELECT u.email, e.granted_at, e.source, e.granted_by
--     FROM public.user_entitlements e
--     JOIN auth.users u ON u.id = e.user_id
--    WHERE e.offer_slug = 'consultation-call'
--    ORDER BY e.granted_at DESC;
