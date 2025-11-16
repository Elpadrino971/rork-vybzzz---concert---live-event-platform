-- ================================================================
-- ADAPTIVE FIX: Add missing columns to profiles table
-- ================================================================
--
-- This migration adapts to whatever columns already exist
-- and only adds what's missing. It's 100% safe to run.
--
-- Date: 2025-11-16
-- ================================================================

-- Helper function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND information_schema.columns.table_name = column_exists.table_name
      AND information_schema.columns.column_name = column_exists.column_name
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Add essential columns if they don't exist
-- ================================================================

-- Add id if missing (should always exist, but just in case)
DO $$
BEGIN
  IF NOT column_exists('profiles', 'id') THEN
    ALTER TABLE profiles ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    RAISE NOTICE 'Added column: id';
  END IF;
END $$;

-- Add email if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Added column: email';
  END IF;
END $$;

-- Add full_name if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added column: full_name';
  END IF;
END $$;

-- Add display_name if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'display_name') THEN
    ALTER TABLE profiles ADD COLUMN display_name TEXT;
    RAISE NOTICE 'Added column: display_name';

    -- Only try to populate from full_name if both columns now exist
    IF column_exists('profiles', 'full_name') THEN
      UPDATE profiles SET display_name = full_name WHERE display_name IS NULL;
      RAISE NOTICE 'Populated display_name from full_name';
    END IF;
  END IF;
END $$;

-- Add avatar_url if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added column: avatar_url';
  END IF;
END $$;

-- Add user_type if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'user_type') THEN
    ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'fan' CHECK (user_type IN ('fan', 'artist', 'affiliate'));
    RAISE NOTICE 'Added column: user_type';
  END IF;
END $$;

-- Add stripe_account_id if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'stripe_account_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_account_id TEXT;
    RAISE NOTICE 'Added column: stripe_account_id';
  END IF;
END $$;

-- Add stripe_customer_id if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
    RAISE NOTICE 'Added column: stripe_customer_id';
  END IF;
END $$;

-- Add stripe_account_completed if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'stripe_account_completed') THEN
    ALTER TABLE profiles ADD COLUMN stripe_account_completed BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added column: stripe_account_completed';
  END IF;
END $$;

-- Add bio if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
    RAISE NOTICE 'Added column: bio';
  END IF;
END $$;

-- Add phone if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
    RAISE NOTICE 'Added column: phone';
  END IF;
END $$;

-- Add created_at if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    RAISE NOTICE 'Added column: created_at';
  END IF;
END $$;

-- Add updated_at if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    RAISE NOTICE 'Added column: updated_at';
  END IF;
END $$;

-- Add last_login_at if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'last_login_at') THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added column: last_login_at';
  END IF;
END $$;

-- Add is_verified if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'is_verified') THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added column: is_verified';
  END IF;
END $$;

-- Add metadata if missing
DO $$
BEGIN
  IF NOT column_exists('profiles', 'metadata') THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added column: metadata';
  END IF;
END $$;

-- ================================================================
-- Create sync trigger only if both columns exist
-- ================================================================

DO $$
BEGIN
  IF column_exists('profiles', 'full_name') AND column_exists('profiles', 'display_name') THEN

    -- Create or replace function to sync display_name with full_name
    CREATE OR REPLACE FUNCTION sync_display_name()
    RETURNS TRIGGER AS $func$
    BEGIN
      -- If display_name is not set, copy from full_name
      IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
        NEW.display_name := NEW.full_name;
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Drop trigger if exists
    DROP TRIGGER IF EXISTS sync_display_name_trigger ON profiles;

    -- Create trigger to sync display_name
    CREATE TRIGGER sync_display_name_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_display_name();

    RAISE NOTICE 'Created sync_display_name trigger';
  END IF;
END $$;

-- ================================================================
-- Create updated_at trigger if column exists
-- ================================================================

DO $$
BEGIN
  IF column_exists('profiles', 'updated_at') THEN

    -- Create or replace function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Drop trigger if exists
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

    -- Create trigger
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    RAISE NOTICE 'Created update_updated_at trigger';
  END IF;
END $$;

-- ================================================================
-- Create indexes
-- ================================================================

-- Email index (for lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- User type index (for filtering)
DO $$
BEGIN
  IF column_exists('profiles', 'user_type') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
  END IF;
END $$;

-- Display name index (for mobile app)
DO $$
BEGIN
  IF column_exists('profiles', 'display_name') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
  END IF;
END $$;

-- ================================================================
-- Final summary
-- ================================================================

DO $$
DECLARE
  col_count INTEGER;
  col_list TEXT;
BEGIN
  SELECT COUNT(*), string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO col_count, col_list
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Profiles table now has % columns', col_count;
  RAISE NOTICE 'Columns: %', col_list;
  RAISE NOTICE '====================================';
  RAISE NOTICE '✓ Migration completed successfully!';
END $$;

-- Cleanup helper function
DROP FUNCTION IF EXISTS column_exists(text, text);

-- ================================================================
-- USAGE NOTES
-- ================================================================
--
-- This migration is 100% safe to run multiple times.
-- It only adds columns that don't exist.
-- It adapts to whatever structure you currently have.
--
-- After running, check the NOTICE messages to see what was added.
--
-- ================================================================
