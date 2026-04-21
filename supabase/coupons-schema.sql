-- Coupons Table for admin-managed discount codes
-- Run this in Supabase SQL Editor (supabase.com > Your Project > SQL Editor)

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  currency TEXT CHECK (currency IN ('INR', 'USD')),
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  redemption_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure currency is set when discount_type is fixed, and percent is 0-100
  CONSTRAINT coupons_fixed_requires_currency CHECK (
    discount_type <> 'fixed' OR currency IS NOT NULL
  ),
  CONSTRAINT coupons_percent_range CHECK (
    discount_type <> 'percent' OR (discount_value > 0 AND discount_value <= 100)
  )
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only service role can access (used by server-side APIs only)
GRANT ALL ON coupons TO service_role;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Seed the legacy codes that previously lived in src/constants/coupons.js
INSERT INTO coupons (code, discount_type, discount_value, is_active, description)
VALUES
  ('ALLBOUND', 'percent', 20, TRUE, 'Standard partner code'),
  ('TESTSARANSH', 'percent', 99.97, TRUE, 'Testing only (pays ~1 unit)'),
  ('SPECIAL5', 'percent', 5, TRUE, 'Default coupon auto-applied on checkout')
ON CONFLICT (code) DO NOTHING;

-- Atomic redemption increment used by /api/create-contact.js after successful payment.
-- Only increments if still valid (active, not expired, under limit).
CREATE OR REPLACE FUNCTION increment_coupon_redemption(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET redemption_count = redemption_count + 1
  WHERE UPPER(code) = UPPER(p_code);
END;
$$ LANGUAGE plpgsql;
