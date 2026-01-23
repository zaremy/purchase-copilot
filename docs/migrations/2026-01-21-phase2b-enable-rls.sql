-- Phase 2B: Enable RLS and Apply Policies
-- Run in Supabase Dashboard > SQL Editor AFTER auth is working
-- Issue: #41 (2B-2: Client auth + Login UI + Enable RLS)

-- =============================================================================
-- STEP 1: Enable RLS on tables
-- =============================================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 2: Set default user_id on vehicles insert
-- This ensures user_id is ALWAYS set by the database, never client-supplied
-- =============================================================================

ALTER TABLE vehicles ALTER COLUMN user_id SET DEFAULT auth.uid();

-- =============================================================================
-- STEP 3: Vehicles RLS Policies
-- =============================================================================

-- Users can only view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert vehicles for themselves (user_id set by default)
CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own vehicles
CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 4: Profiles RLS Policies
-- =============================================================================

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Note: INSERT handled by trigger, DELETE handled by server-side cascade

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- After running, verify:
-- 1. Table Editor shows "RLS enabled" badge on vehicles and profiles
-- 2. Anon API calls to vehicles return empty array (not error)
-- 3. Authenticated user can only see their own data

-- Test query (run as anon):
-- SELECT * FROM vehicles; -- Should return empty, not error

-- Test query (run as authenticated user):
-- SELECT * FROM vehicles; -- Should return only user's vehicles
