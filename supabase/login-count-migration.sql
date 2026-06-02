-- Login Count Migration
-- Adds a per-user login counter used to schedule the DFY (done-for-you) upsell popup
-- on the course dashboard (fires on login #1, 5, 10, 20, 30, then every +10).
--
-- Run this in Supabase SQL Editor (supabase.com > Your Project > SQL Editor).
-- Safe to run multiple times (idempotent).

-- 1. Add the column (defaults to 0 for existing members)
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;

-- 2. Atomic increment helper, callable from the browser via supabase.rpc().
--    Creates the user's progress row if it doesn't exist yet, otherwise
--    increments login_count by 1. Returns the NEW count.
--    SECURITY DEFINER so it runs even before a progress row exists, but it
--    refuses to touch any account other than the caller's own (auth.uid()).
CREATE OR REPLACE FUNCTION increment_login_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Only allow a signed-in user to increment their own counter.
  -- (auth.uid() is NULL for service-role/anon contexts; block those too.)
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: can only increment own login_count';
  END IF;

  INSERT INTO user_progress (user_id, login_count, last_accessed)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET login_count = user_progress.login_count + 1,
                last_accessed = NOW()
  RETURNING login_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Allow logged-in users to call the function
GRANT EXECUTE ON FUNCTION increment_login_count(UUID) TO authenticated;
