-- Follow-up to consult-call-migration.sql. Run this one after it.
--
-- Covers three things the first pass left open:
--   1. orders could not say WHICH product was bought
--   2. a second consultation purchase was invisible (the entitlement is a
--      yes/no, so buying again changed nothing on screen)
--   3. invoices back-computed the GST split from the gross, which never lands
--      on the advertised price (₹3,539 / 1.18 = ₹2,999.15, not ₹2,999)

-- 1. What was bought, and the exact split we charged.
--    base_amount and gst_amount use the same smallest-unit convention as
--    `amount` (paise for INR, cents for USD), so ₹2,999 + ₹540 is 299900 + 54000.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product     text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS base_amount integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_amount  integer;

CREATE INDEX IF NOT EXISTS idx_orders_product ON public.orders(product);
-- The vault counts a member's consultations on every load.
CREATE INDEX IF NOT EXISTS idx_orders_user_product ON public.orders(user_id, product);

-- 2. Every order that predates this column was the course — checkout has never
--    sold anything else. Consultations are tagged at write time by
--    /api/consult-purchase, so this only ever touches historical rows.
UPDATE public.orders
   SET product = 'outbound-mastery'
 WHERE product IS NULL;

-- base_amount/gst_amount are deliberately NOT backfilled. We don't know the
-- exact split those older payments were charged with, and inventing one would
-- put a wrong number on a tax invoice. api/admin/generate-invoices.js falls
-- back to the old division whenever these are null, so historical invoices come
-- out exactly as they did before.

-- Sanity check after running:
--   SELECT product, count(*), sum(amount)/100.0 AS gross
--     FROM public.orders GROUP BY product ORDER BY 2 DESC;
