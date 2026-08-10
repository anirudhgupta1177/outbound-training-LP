-- Master portal: multiple Intent Led Sales offers behind one login.
--
-- These tables are service-role only (RLS on, no public policies) apart from
-- members reading their own entitlements. The browser reads the vault through
-- /api/offers, which gates each offer's content by entitlement.
--
-- Already applied to the live project via migrations:
--   create_portal_offers_and_entitlements
--   seed_portal_offers_and_backfill_entitlements
-- Kept here so the schema is reproducible from the repo.

CREATE TABLE IF NOT EXISTS public.portal_offers (
  id                  uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug                text NOT NULL UNIQUE,
  title               text NOT NULL,
  subtitle            text,
  description         text,
  kind                text NOT NULL DEFAULT 'course'
                        CHECK (kind = ANY (ARRAY['course','micro_course','consult'])),
  badge               text,
  duration_label      text,
  highlights          text[] DEFAULT '{}',
  portal_path         text,             -- in-app route for unlocked members
  landing_page_url    text,             -- sales page for locked members
  cta_url             text,             -- external CTA (consult booking link)
  cta_label           text,
  locked_cta_label    text,
  primary_video_url   text,             -- only served to entitled members
  primary_video_title text,
  accent              text NOT NULL DEFAULT 'cyan'
                        CHECK (accent = ANY (ARRAY['cyan','amber','purple','emerald'])),
  unlocked_by_default boolean NOT NULL DEFAULT false,
  is_active           boolean NOT NULL DEFAULT true,
  order_index         integer NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portal_offer_resources (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  offer_id    uuid NOT NULL REFERENCES public.portal_offers(id) ON DELETE CASCADE,
  title       text NOT NULL,
  url         text NOT NULL,
  type        text NOT NULL DEFAULT 'link'
                CHECK (type = ANY (ARRAY['link','whimsical','drive','doc','file','notion','video','tool'])),
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_offer_resources_offer_id_idx
  ON public.portal_offer_resources(offer_id);

CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id         uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_slug text NOT NULL,
  source     text NOT NULL DEFAULT 'admin'
               CHECK (source = ANY (ARRAY['purchase','admin','migration'])),
  granted_by text,
  granted_at timestamptz DEFAULT now(),
  UNIQUE (user_id, offer_slug)
);
CREATE INDEX IF NOT EXISTS user_entitlements_user_id_idx
  ON public.user_entitlements(user_id);

CREATE TABLE IF NOT EXISTS public.portal_settings (
  id               text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  booking_url      text,
  vault_heading    text,
  vault_subheading text,
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.portal_offers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_offer_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own entitlements" ON public.user_entitlements;
CREATE POLICY "Users read own entitlements" ON public.user_entitlements
  FOR SELECT USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS portal_offers_updated_at ON public.portal_offers;
CREATE TRIGGER portal_offers_updated_at
  BEFORE UPDATE ON public.portal_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS portal_offer_resources_updated_at ON public.portal_offer_resources;
CREATE TRIGGER portal_offer_resources_updated_at
  BEFORE UPDATE ON public.portal_offer_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Every account that existed before the vault shipped was provisioned by an
-- Outbound Mastery purchase, so grant them that entitlement explicitly.
INSERT INTO public.user_entitlements (user_id, offer_slug, source, granted_by)
SELECT u.id, 'outbound-mastery', 'migration', 'backfill'
FROM auth.users u
ON CONFLICT (user_id, offer_slug) DO NOTHING;
