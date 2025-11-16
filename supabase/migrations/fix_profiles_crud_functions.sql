-- ================================================================
-- CRITICAL FIX: Add CRUD operations to profiles view
-- ================================================================
--
-- This migration adds INSERT/UPDATE/DELETE support to the profiles
-- view by creating INSTEAD OF triggers that redirect operations
-- to the underlying users table.
--
-- Date: 2025-11-16
-- ================================================================

-- ================================================================
-- Drop existing view and recreate as updatable view
-- ================================================================

DROP VIEW IF EXISTS profiles CASCADE;

-- Create profiles view (must be created first before triggers)
CREATE OR REPLACE VIEW profiles AS
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
  -- Stripe fields from artist or fan tables
  COALESCE(a.stripe_customer_id, f.stripe_customer_id) AS stripe_customer_id,
  a.stripe_account_id,
  a.stripe_account_completed,
  -- Bio field
  a.bio
FROM users u
LEFT JOIN artists a ON u.id = a.id
LEFT JOIN fans f ON u.id = f.id;

-- ================================================================
-- INSERT trigger function
-- ================================================================

CREATE OR REPLACE FUNCTION profiles_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO users (
    id,
    email,
    phone,
    full_name,
    avatar_url,
    user_type,
    is_active,
    metadata
  ) VALUES (
    COALESCE(NEW.id, uuid_generate_v4()),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.full_name, NEW.display_name),
    NEW.avatar_url,
    COALESCE(NEW.user_type, 'fan'),
    COALESCE(NEW.is_active, true),
    COALESCE(NEW.metadata, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    user_type = EXCLUDED.user_type,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = timezone('utc'::text, now());

  -- If user_type is 'artist', also insert into artists table
  IF COALESCE(NEW.user_type, 'fan') = 'artist' THEN
    INSERT INTO artists (id, bio, stage_name, stripe_account_id, stripe_customer_id)
    VALUES (
      COALESCE(NEW.id, uuid_generate_v4()),
      NEW.bio,
      COALESCE(NEW.full_name, NEW.display_name, 'Unknown Artist'),
      NEW.stripe_account_id,
      NEW.stripe_customer_id
    )
    ON CONFLICT (id) DO UPDATE SET
      bio = EXCLUDED.bio,
      stripe_account_id = EXCLUDED.stripe_account_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id;
  END IF;

  -- If user_type is 'fan', also insert into fans table
  IF COALESCE(NEW.user_type, 'fan') = 'fan' THEN
    INSERT INTO fans (id, stripe_customer_id)
    VALUES (
      COALESCE(NEW.id, uuid_generate_v4()),
      NEW.stripe_customer_id
    )
    ON CONFLICT (id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- UPDATE trigger function
-- ================================================================

CREATE OR REPLACE FUNCTION profiles_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table
  UPDATE users SET
    email = COALESCE(NEW.email, OLD.email),
    phone = COALESCE(NEW.phone, OLD.phone),
    full_name = COALESCE(NEW.full_name, NEW.display_name, OLD.full_name),
    avatar_url = COALESCE(NEW.avatar_url, OLD.avatar_url),
    user_type = COALESCE(NEW.user_type, OLD.user_type),
    is_active = COALESCE(NEW.is_active, OLD.is_active),
    metadata = COALESCE(NEW.metadata, OLD.metadata),
    updated_at = timezone('utc'::text, now())
  WHERE id = OLD.id;

  -- Update artist-specific fields if applicable
  IF EXISTS (SELECT 1 FROM artists WHERE id = OLD.id) THEN
    UPDATE artists SET
      bio = COALESCE(NEW.bio, bio),
      stripe_account_id = COALESCE(NEW.stripe_account_id, stripe_account_id),
      stripe_account_completed = COALESCE(NEW.stripe_account_completed, stripe_account_completed),
      stripe_customer_id = COALESCE(NEW.stripe_customer_id, stripe_customer_id)
    WHERE id = OLD.id;
  END IF;

  -- Update fan-specific fields if applicable
  IF EXISTS (SELECT 1 FROM fans WHERE id = OLD.id) THEN
    UPDATE fans SET
      stripe_customer_id = COALESCE(NEW.stripe_customer_id, stripe_customer_id)
    WHERE id = OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- DELETE trigger function
-- ================================================================

CREATE OR REPLACE FUNCTION profiles_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from users table (cascades to artists/fans)
  DELETE FROM users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Create INSTEAD OF triggers
-- ================================================================

DROP TRIGGER IF EXISTS profiles_insert_trigger ON profiles;
CREATE TRIGGER profiles_insert_trigger
INSTEAD OF INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION profiles_insert_trigger();

DROP TRIGGER IF EXISTS profiles_update_trigger ON profiles;
CREATE TRIGGER profiles_update_trigger
INSTEAD OF UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION profiles_update_trigger();

DROP TRIGGER IF EXISTS profiles_delete_trigger ON profiles;
CREATE TRIGGER profiles_delete_trigger
INSTEAD OF DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION profiles_delete_trigger();

-- ================================================================
-- Grant permissions
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- ================================================================
-- Create helper function to get user profile
-- ================================================================

CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  user_type TEXT,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  bio TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.display_name,
    p.avatar_url,
    p.user_type,
    p.stripe_customer_id,
    p.stripe_account_id,
    p.bio
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO anon;

-- ================================================================
-- USAGE NOTES
-- ================================================================
--
-- The profiles view now supports full CRUD operations:
--
-- SELECT:
--   SELECT * FROM profiles WHERE id = 'uuid';
--
-- INSERT:
--   INSERT INTO profiles (email, full_name, user_type)
--   VALUES ('user@example.com', 'John Doe', 'fan');
--
-- UPDATE:
--   UPDATE profiles SET avatar_url = 'https://...' WHERE id = 'uuid';
--
-- DELETE:
--   DELETE FROM profiles WHERE id = 'uuid';
--
-- All operations will properly update the underlying users, artists,
-- and fans tables as appropriate.
--
-- ================================================================
