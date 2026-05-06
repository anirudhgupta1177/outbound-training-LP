-- Pricing Tiers Table for admin-managed course prices
-- Run this in Supabase SQL Editor (supabase.com > Your Project > SQL Editor)
--
-- Stores one row per geo tier:
--   INDIA          → users detected in 'IN'
--   SAARC          → Bangladesh, Pakistan, Nepal, Sri Lanka, Bhutan
--   INTERNATIONAL  → everyone else
--
-- The frontend formats `base_price` + `currency` into the display string
-- (₹3,999 / $129) so admins only need to enter the numeric price.

CREATE TABLE IF NOT EXISTS pricing_tiers (
  tier TEXT PRIMARY KEY CHECK (tier IN ('INDIA', 'SAARC', 'INTERNATIONAL')),
  currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
  symbol TEXT NOT NULL,
  base_price NUMERIC NOT NULL CHECK (base_price > 0),
  original_price NUMERIC NOT NULL CHECK (original_price > 0),
  gst_rate NUMERIC NOT NULL DEFAULT 0 CHECK (gst_rate >= 0 AND gst_rate < 1),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
GRANT ALL ON pricing_tiers TO service_role;

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_pricing_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_tiers_updated_at();

-- Seed with the same defaults that previously lived in src/constants/pricing.js
INSERT INTO pricing_tiers (tier, currency, symbol, base_price, original_price, gst_rate) VALUES
  ('INDIA',         'INR', '₹', 3999, 49999, 0.18),
  ('SAARC',         'USD', '$',   47,  1499, 0),
  ('INTERNATIONAL', 'USD', '$',  129,  3999, 0)
ON CONFLICT (tier) DO NOTHING;
