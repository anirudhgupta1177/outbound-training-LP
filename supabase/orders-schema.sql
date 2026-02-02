-- Orders Table for tracking all payments
-- Run this in Supabase SQL Editor (supabase.com > Your Project > SQL Editor)

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT,
  amount INTEGER NOT NULL, -- Amount in smallest unit (paise for INR, cents for USD)
  currency TEXT NOT NULL DEFAULT 'INR',
  region TEXT NOT NULL DEFAULT 'INDIA', -- INDIA, SAARC, or INTERNATIONAL
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  coupon_code TEXT,
  
  -- GST Details (optional, for B2B invoicing)
  has_gst BOOLEAN DEFAULT FALSE,
  gstin TEXT, -- Customer's GSTIN
  business_name TEXT, -- Customer's business name
  business_address TEXT, -- Customer's business address
  business_state TEXT, -- State for Place of Supply
  business_state_code TEXT, -- 2-digit state code
  
  -- Invoice Details
  invoice_number TEXT UNIQUE, -- Auto-generated: TOB/YYYY/NNNNN
  invoice_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for API endpoints)
GRANT ALL ON orders TO service_role;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_region ON orders(region);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Sequence for invoice numbers (year-based)
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  seq_part := LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
  RETURN 'TOB/' || year_part || '/' || seq_part;
END;
$$ LANGUAGE plpgsql;
