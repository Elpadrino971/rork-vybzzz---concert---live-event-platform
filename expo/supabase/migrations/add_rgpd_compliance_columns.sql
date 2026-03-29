/**
 * RGPD Compliance: Add deleted_at columns
 *
 * Supports "soft delete" + anonymization strategy
 * Required for RGPD Article 17 (Right to Erasure)
 *
 * French/EU law requires keeping financial records for 10 years,
 * so we anonymize personal data instead of hard deleting.
 */

-- Add deleted_at to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at
ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add deleted_at to artists table
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_artists_deleted_at
ON artists(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add deleted_at to affiliates table
ALTER TABLE affiliates
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_affiliates_deleted_at
ON affiliates(deleted_at) WHERE deleted_at IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN profiles.deleted_at IS 'RGPD compliance: Timestamp when user requested account deletion';
COMMENT ON COLUMN artists.deleted_at IS 'RGPD compliance: Timestamp when artist account was deleted';
COMMENT ON COLUMN affiliates.deleted_at IS 'RGPD compliance: Timestamp when affiliate account was deleted';

-- Add RLS policy to exclude deleted users from public queries
-- This ensures deleted users don't show up in searches/lists

-- Policy for profiles
DROP POLICY IF EXISTS "Exclude deleted profiles from public queries" ON profiles;
CREATE POLICY "Exclude deleted profiles from public queries"
ON profiles FOR SELECT
USING (deleted_at IS NULL OR auth.uid() = id);

-- Policy for artists
DROP POLICY IF EXISTS "Exclude deleted artists from public queries" ON artists;
CREATE POLICY "Exclude deleted artists from public queries"
ON artists FOR SELECT
USING (deleted_at IS NULL);

-- Note: We keep artist content (events, shorts) visible even after deletion
-- but the artist appears as "Anonymous Artist [ID]"
