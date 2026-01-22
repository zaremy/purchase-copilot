-- Phase 2B: Authentication Schema Migration
-- Run in Supabase Dashboard > SQL Editor
-- Issue: #40 (2B-1: Database schema)

-- =============================================================================
-- STEP 1: Add user_id to vehicles table
-- =============================================================================

-- Add user_id column (nullable for now - existing rows have no user)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- =============================================================================
-- STEP 2: Create profiles table
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  email TEXT,
  phone TEXT,
  zip_code TEXT,
  entitlements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- STEP 3: Create trigger to auto-create profile on user signup
-- =============================================================================

-- Function to create profile row when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 4: RLS POLICIES (DO NOT ENABLE YET - PR2 will enable)
-- These are drafted here for reference. Run them in PR2 after auth is enforced.
-- =============================================================================

/*
-- Enable RLS (run in PR2)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Vehicles policies
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Set default for user_id on insert (run in PR2)
ALTER TABLE vehicles ALTER COLUMN user_id SET DEFAULT auth.uid();
*/

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- After running, verify:
-- 1. SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'user_id';
-- 2. SELECT * FROM profiles LIMIT 1; (should be empty)
-- 3. Create a test user in Auth > Users, then check profiles table has a row
