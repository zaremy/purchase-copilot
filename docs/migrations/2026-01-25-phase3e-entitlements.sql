-- Phase 3E: Entitlements Schema Migration
-- Run in Supabase Dashboard > SQL Editor
-- Issue: #4 (Phase 3E: Billing Tools)

-- =============================================================================
-- STEP 1: Add revenuecat_app_user_id to profiles table
-- =============================================================================

-- Add column for RevenueCat user mapping
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS revenuecat_app_user_id TEXT UNIQUE;

-- Index for faster webhook user resolution
CREATE INDEX IF NOT EXISTS idx_profiles_revenuecat_app_user_id ON profiles(revenuecat_app_user_id);

-- =============================================================================
-- STEP 2: Create webhook_receipts table
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhook_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE, -- RevenueCat event_id (idempotency key)
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  app_user_id TEXT NOT NULL, -- RevenueCat app_user_id (text, may not be UUID)
  user_id UUID REFERENCES profiles(id), -- resolved profile UUID (nullable if unresolved)
  payload_hash TEXT NOT NULL,
  processed_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processed' | 'skipped'
  skipped_reason TEXT,
  entitlement_snapshot JSONB, -- state after processing (null until processed)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index for faster lookup by app_user_id (webhook resolution)
CREATE INDEX IF NOT EXISTS idx_webhook_receipts_app_user_id ON webhook_receipts(app_user_id);

-- Index for audit queries by user
CREATE INDEX IF NOT EXISTS idx_webhook_receipts_user_id ON webhook_receipts(user_id);

-- =============================================================================
-- STEP 3: Create admin_receipts table
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL, -- service key identifier
  user_id UUID NOT NULL REFERENCES profiles(id),
  operation TEXT NOT NULL, -- 'set' | 'revoke'
  reason TEXT NOT NULL,
  entitlement_before JSONB,
  entitlement_after JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit queries by user
CREATE INDEX IF NOT EXISTS idx_admin_receipts_user_id ON admin_receipts(user_id);

-- =============================================================================
-- STEP 4: RLS Policies for new tables
-- =============================================================================

-- Enable RLS
ALTER TABLE webhook_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_receipts ENABLE ROW LEVEL SECURITY;

-- Webhook receipts: only service role can access (server-only)
-- No user policies - handled by server with service key

-- Admin receipts: only service role can access (server-only)
-- No user policies - handled by server with service key

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- After running, verify:
-- 1. SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'revenuecat_app_user_id';
-- 2. SELECT * FROM webhook_receipts LIMIT 1; (should be empty)
-- 3. SELECT * FROM admin_receipts LIMIT 1; (should be empty)
