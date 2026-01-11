-- Admin Portal Schema for Course Management
-- Run this in Supabase SQL Editor AFTER schema.sql

-- ============================================
-- MODULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view published modules)
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (is_published = true);

-- Service role has full access (for admin API)
GRANT ALL ON modules TO service_role;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(order_index);

-- ============================================
-- LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  loom_url TEXT,
  duration TEXT, -- e.g., "12:34"
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'coming-soon', 'draft')),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view published lessons)
CREATE POLICY "Anyone can view published lessons" ON lessons
  FOR SELECT USING (is_published = true);

-- Service role has full access (for admin API)
GRANT ALL ON lessons TO service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);

-- ============================================
-- RESOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'link' CHECK (type IN ('link', 'whimsical', 'drive', 'doc', 'file', 'notion', 'video')),
  category TEXT DEFAULT 'resource' CHECK (category IN ('guide', 'template', 'diagram', 'document', 'database', 'resource')),
  description TEXT,
  is_global BOOLEAN DEFAULT false, -- true for resources shown on Resources page
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

-- Service role has full access (for admin API)
GRANT ALL ON resources TO service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resources_lesson ON resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_resources_module ON resources(module_id);
CREATE INDEX IF NOT EXISTS idx_resources_global ON resources(is_global);

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN SESSIONS TABLE (for JWT tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access
GRANT ALL ON admin_sessions TO service_role;

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View to get modules with lesson count
CREATE OR REPLACE VIEW modules_with_stats AS
SELECT 
  m.*,
  COUNT(l.id) AS lesson_count,
  COUNT(CASE WHEN l.status = 'available' THEN 1 END) AS available_lessons,
  COUNT(CASE WHEN l.status = 'coming-soon' THEN 1 END) AS coming_soon_lessons
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
GROUP BY m.id
ORDER BY m.order_index;

-- Grant access to views
GRANT SELECT ON modules_with_stats TO service_role;
GRANT SELECT ON modules_with_stats TO anon;
GRANT SELECT ON modules_with_stats TO authenticated;

