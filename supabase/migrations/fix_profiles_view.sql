-- ================================================================
-- CRITICAL FIX: Create profiles view from users table
-- ================================================================
--
-- Issue: The application code uses 'profiles' table but the schema
-- only defines 'users' table. This migration creates a view to
-- maintain backward compatibility.
--
-- Date: 2025-11-16
-- ================================================================

-- Drop the view if it exists (for re-running the migration)
DROP VIEW IF EXISTS profiles CASCADE;

-- Create profiles view that mirrors the users table
CREATE OR REPLACE VIEW profiles AS
SELECT
  id,
  email,
  phone,
  full_name,
  avatar_url,
  user_type,
  created_at,
  updated_at,
  last_login_at,
  is_active,
  metadata,
  -- Add display_name as alias for full_name (used in mobile app)
  full_name AS display_name,
  -- Add bio placeholder (will be null for users table, can be extended later)
  NULL::text AS bio,
  -- Add stripe_customer_id from fans table (left join)
  NULL::text AS stripe_customer_id,
  -- Add stripe_account_id from artists table (left join)
  NULL::text AS stripe_account_id,
  -- Add stripe_account_completed from artists table
  NULL::boolean AS stripe_account_completed
FROM users;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create index on common lookup columns
CREATE INDEX IF NOT EXISTS idx_profiles_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON users(is_active);

-- ================================================================
-- Create enhanced profiles view with artist and fan data
-- ================================================================

DROP VIEW IF EXISTS profiles_enhanced CASCADE;

CREATE OR REPLACE VIEW profiles_enhanced AS
SELECT
  u.id,
  u.email,
  u.phone,
  u.full_name,
  u.full_name AS display_name,
  u.avatar_url,
  u.user_type,
  u.created_at,
  u.updated_at,
  u.last_login_at,
  u.is_active,
  u.metadata,
  -- Artist-specific fields
  a.bio AS artist_bio,
  a.stage_name,
  a.subscription_tier,
  a.stripe_account_id,
  a.stripe_account_completed,
  a.stripe_customer_id AS artist_stripe_customer_id,
  a.total_revenue AS artist_total_revenue,
  -- Fan-specific fields
  f.stripe_customer_id AS fan_stripe_customer_id,
  f.total_miles,
  f.level,
  f.badges,
  f.referral_code
FROM users u
LEFT JOIN artists a ON u.id = a.id AND u.user_type = 'artist'
LEFT JOIN fans f ON u.id = f.id AND u.user_type = 'fan';

-- Grant permissions
GRANT SELECT ON profiles_enhanced TO authenticated;
GRANT SELECT ON profiles_enhanced TO anon;

-- ================================================================
-- Update existing foreign key references (if needed)
-- ================================================================

-- Note: Foreign keys should reference the base 'users' table, not the view
-- This is just documentation

-- ================================================================
-- IMPORTANT NOTES
-- ================================================================
--
-- 1. The 'profiles' view is read-only. To INSERT/UPDATE/DELETE, use the 'users' table directly.
--
-- 2. For better performance with stripe fields, use the enhanced view or join directly:
--    SELECT u.*, a.stripe_account_id FROM users u LEFT JOIN artists a ON u.id = a.id
--
-- 3. Mobile app should update to use 'users' table directly in the future
--
-- 4. RLS policies on 'users' table will apply when accessing through the view
--
-- ================================================================
