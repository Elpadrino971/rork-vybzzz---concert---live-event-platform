-- ================================================================
-- FIX: Add missing columns to existing profiles table
-- ================================================================
--
-- This migration adds columns that the code expects but may be
-- missing from the profiles table.
--
-- Date: 2025-11-16
-- ================================================================

-- Add display_name column if missing (used by mobile app)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;

        -- Copy full_name to display_name for existing rows
        UPDATE profiles SET display_name = full_name WHERE display_name IS NULL;
    END IF;
END $$;

-- Add stripe_account_completed column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'stripe_account_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN stripe_account_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add phone column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Add last_login_at column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add metadata column if missing (for flexible data storage)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Ensure stripe_account_id allows NULL (for non-artists)
ALTER TABLE profiles ALTER COLUMN stripe_account_id DROP NOT NULL;

-- Ensure stripe_customer_id allows NULL (for non-fans)
ALTER TABLE profiles ALTER COLUMN stripe_customer_id DROP NOT NULL;

-- Create or replace function to sync display_name with full_name
CREATE OR REPLACE FUNCTION sync_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If display_name is not set, copy from full_name
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name := NEW.full_name;
  END IF;

  -- If full_name is updated and display_name was the same, update both
  IF OLD.full_name IS NOT NULL AND OLD.display_name = OLD.full_name THEN
    IF NEW.full_name != OLD.full_name THEN
      NEW.display_name := NEW.full_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync display_name
DROP TRIGGER IF EXISTS sync_display_name_trigger ON profiles;
CREATE TRIGGER sync_display_name_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_display_name();

-- Create index on display_name for mobile app queries
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Verify all columns exist
DO $$
DECLARE
  missing_columns TEXT[];
  col TEXT;
BEGIN
  -- Check for required columns
  SELECT ARRAY_AGG(column_name)
  INTO missing_columns
  FROM (
    VALUES
      ('id'),
      ('email'),
      ('full_name'),
      ('display_name'),
      ('avatar_url'),
      ('user_type'),
      ('stripe_account_id'),
      ('stripe_customer_id'),
      ('stripe_account_completed'),
      ('bio'),
      ('phone'),
      ('created_at'),
      ('updated_at'),
      ('last_login_at'),
      ('metadata')
  ) AS required(column_name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_name = 'profiles'
    AND c.column_name = required.column_name
  );

  IF missing_columns IS NOT NULL AND array_length(missing_columns, 1) > 0 THEN
    RAISE WARNING 'Missing columns in profiles table: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'All required columns exist in profiles table ✓';
  END IF;
END $$;

-- ================================================================
-- NOTES
-- ================================================================
--
-- This migration is safe to run multiple times (idempotent)
-- - Uses IF NOT EXISTS checks for all ALTER TABLE statements
-- - Only adds missing columns
-- - Updates existing data where appropriate
--
-- After running this migration:
-- 1. Test with: SELECT * FROM profiles LIMIT 1;
-- 2. Verify columns: \d profiles (in psql)
-- 3. Run integration tests
--
-- ================================================================
