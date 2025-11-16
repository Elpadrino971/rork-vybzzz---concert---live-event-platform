-- ================================================================
-- FIX: Ensure profiles.id has proper default value and constraints
-- ================================================================
--
-- This migration fixes the id column to have a default UUID generator
-- and proper constraints
--
-- Date: 2025-11-16
-- ================================================================

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add default value to id column if it doesn't have one
DO $$
BEGIN
  -- Check if id column has a default value
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
      AND column_default IS NOT NULL
  ) THEN
    -- Add default UUID generation
    ALTER TABLE profiles
    ALTER COLUMN id SET DEFAULT uuid_generate_v4();

    RAISE NOTICE '✓ Added default UUID generator to id column';
  ELSE
    RAISE NOTICE '✓ id column already has a default value';
  END IF;
END $$;

-- Ensure id column is NOT NULL
DO $$
BEGIN
  ALTER TABLE profiles
  ALTER COLUMN id SET NOT NULL;

  RAISE NOTICE '✓ Ensured id column is NOT NULL';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ id column already NOT NULL';
END $$;

-- Ensure id column is PRIMARY KEY
DO $$
BEGIN
  -- Check if primary key exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE profiles ADD PRIMARY KEY (id);
    RAISE NOTICE '✓ Added PRIMARY KEY constraint to id';
  ELSE
    RAISE NOTICE '✓ id column already has PRIMARY KEY';
  END IF;
END $$;

-- Optional: Add foreign key to auth.users if auth schema exists
DO $$
BEGIN
  -- Check if auth.users table exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'auth'
      AND table_name = 'users'
  ) THEN
    -- Check if foreign key already exists
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'profiles'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_schema = 'auth'
        AND ccu.table_name = 'users'
    ) THEN
      -- Add foreign key constraint
      ALTER TABLE profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

      RAISE NOTICE '✓ Added foreign key to auth.users(id)';
    ELSE
      RAISE NOTICE '✓ Foreign key to auth.users already exists';
    END IF;
  ELSE
    RAISE NOTICE '⚠ auth.users table not found - skipping foreign key';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠ Could not add foreign key to auth.users (this is OK if using standalone profiles)';
END $$;

-- Verify the fix
DO $$
DECLARE
  has_default BOOLEAN;
  is_not_null BOOLEAN;
  is_primary_key BOOLEAN;
BEGIN
  -- Check default
  SELECT column_default IS NOT NULL
  INTO has_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'id';

  -- Check NOT NULL
  SELECT is_nullable = 'NO'
  INTO is_not_null
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'id';

  -- Check PRIMARY KEY
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_type = 'PRIMARY KEY'
  ) INTO is_primary_key;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'ID Column Status:';
  RAISE NOTICE '  Default value: %', CASE WHEN has_default THEN '✓' ELSE '✗' END;
  RAISE NOTICE '  NOT NULL: %', CASE WHEN is_not_null THEN '✓' ELSE '✗' END;
  RAISE NOTICE '  PRIMARY KEY: %', CASE WHEN is_primary_key THEN '✓' ELSE '✗' END;

  IF has_default AND is_not_null AND is_primary_key THEN
    RAISE NOTICE 'Status: ✓ ALL CHECKS PASSED';
  ELSE
    RAISE WARNING 'Status: ✗ SOME CHECKS FAILED';
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- NOTES
-- ================================================================
--
-- This migration ensures that the id column can:
-- 1. Generate UUIDs automatically when not specified
-- 2. Serve as PRIMARY KEY
-- 3. Reference auth.users(id) if using Supabase Auth
--
-- After this migration, INSERT without id will work:
-- INSERT INTO profiles (email, full_name) VALUES (...);
--
-- ================================================================
