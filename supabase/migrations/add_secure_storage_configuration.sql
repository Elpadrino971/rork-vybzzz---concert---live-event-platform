-- ============================================
-- SUPABASE STORAGE - SECURE CONFIGURATION
-- ============================================
-- This migration creates secure storage buckets with RLS policies
-- for the VyBzzZ platform
--
-- Buckets created:
-- - event-images: Images d'événements (max 5MB)
-- - event-videos: Vidéos d'événements (max 500MB)
-- - user-avatars: Avatars utilisateurs (max 2MB)
-- - event-thumbnails: Miniatures d'événements (max 1MB)
-- - artist-banners: Bannières artistes (max 3MB)
-- - shorts-videos: Vidéos courts (TikTok-style) (max 100MB)
--
-- Security:
-- - Public read access for all buckets
-- - Authenticated write/delete access
-- - Owner-only write for user-avatars
-- - File size limits enforced
-- - MIME type validation
-- ============================================

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

-- Bucket: event-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: event-videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-videos',
  'event-videos',
  true,
  524288000, -- 500MB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: user-avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: event-thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-thumbnails',
  'event-thumbnails',
  true,
  1048576, -- 1MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: artist-banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artist-banners',
  'artist-banners',
  true,
  3145728, -- 3MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: shorts-videos (TikTok-style content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shorts-videos',
  'shorts-videos',
  true,
  104857600, -- 100MB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. STORAGE RLS POLICIES - EVENT IMAGES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for event-images" ON storage.objects;

-- Public read access
CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated write access for event-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update
CREATE POLICY "Authenticated update access for event-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete
CREATE POLICY "Authenticated delete access for event-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 3. STORAGE RLS POLICIES - EVENT VIDEOS
-- ============================================

DROP POLICY IF EXISTS "Public read access for event-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for event-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for event-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for event-videos" ON storage.objects;

CREATE POLICY "Public read access for event-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-videos');

CREATE POLICY "Authenticated write access for event-videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update access for event-videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-videos'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 4. STORAGE RLS POLICIES - USER AVATARS
-- ============================================

DROP POLICY IF EXISTS "Public read access for user-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Public read access
CREATE POLICY "Public read access for user-avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Users can upload their own avatar (path must start with their user ID)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 5. STORAGE RLS POLICIES - EVENT THUMBNAILS
-- ============================================

DROP POLICY IF EXISTS "Public read access for event-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for event-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for event-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for event-thumbnails" ON storage.objects;

CREATE POLICY "Public read access for event-thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-thumbnails');

CREATE POLICY "Authenticated write access for event-thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-thumbnails'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update access for event-thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-thumbnails'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-thumbnails'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 6. STORAGE RLS POLICIES - ARTIST BANNERS
-- ============================================

DROP POLICY IF EXISTS "Public read access for artist-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for artist-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for artist-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for artist-banners" ON storage.objects;

CREATE POLICY "Public read access for artist-banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-banners');

CREATE POLICY "Authenticated write access for artist-banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artist-banners'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update access for artist-banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artist-banners'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for artist-banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artist-banners'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 7. STORAGE RLS POLICIES - SHORTS VIDEOS
-- ============================================

DROP POLICY IF EXISTS "Public read access for shorts-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for shorts-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for shorts-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for shorts-videos" ON storage.objects;

CREATE POLICY "Public read access for shorts-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shorts-videos');

CREATE POLICY "Authenticated write access for shorts-videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shorts-videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update access for shorts-videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shorts-videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for shorts-videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shorts-videos'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 8. STORAGE HELPER FUNCTIONS
-- ============================================

-- Function to get file extension from filename
CREATE OR REPLACE FUNCTION storage.get_file_extension(filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(substring(filename from '\.([^\.]*)$'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate image file
CREATE OR REPLACE FUNCTION storage.is_valid_image(filename TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN storage.get_file_extension(filename) IN ('jpg', 'jpeg', 'png', 'webp', 'gif');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate video file
CREATE OR REPLACE FUNCTION storage.is_valid_video(filename TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN storage.get_file_extension(filename) IN ('mp4', 'webm', 'mov', 'mkv');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION storage.generate_unique_filename(original_filename TEXT)
RETURNS TEXT AS $$
DECLARE
  extension TEXT;
  timestamp_str TEXT;
  random_str TEXT;
BEGIN
  extension := storage.get_file_extension(original_filename);
  timestamp_str := extract(epoch from now())::TEXT;
  random_str := substr(md5(random()::TEXT), 1, 8);
  RETURN timestamp_str || '-' || random_str || '.' || extension;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================
-- 9. STORAGE AUDIT TABLE (OPTIONAL)
-- ============================================

-- Table to track storage operations for security and debugging
CREATE TABLE IF NOT EXISTS storage_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  bucket_id TEXT NOT NULL,
  object_path TEXT NOT NULL,
  operation TEXT CHECK (operation IN ('upload', 'delete', 'update')) NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_user_id ON storage_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_bucket_id ON storage_audit_log(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_log_created_at ON storage_audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE storage_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "Users can view own storage audit logs"
ON storage_audit_log FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert storage audit logs"
ON storage_audit_log FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 10. STORAGE STATISTICS VIEW
-- ============================================

-- View to track storage usage per user
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT
  owner AS user_id,
  bucket_id,
  COUNT(*) AS file_count,
  SUM((metadata->>'size')::BIGINT) AS total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_size_mb
FROM storage.objects
GROUP BY owner, bucket_id;

-- View to track storage usage per bucket
CREATE OR REPLACE VIEW storage_usage_by_bucket AS
SELECT
  bucket_id,
  COUNT(*) AS file_count,
  SUM((metadata->>'size')::BIGINT) AS total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_size_mb,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0 / 1024.0, 2) AS total_size_gb
FROM storage.objects
GROUP BY bucket_id
ORDER BY total_size_bytes DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Comment explaining the migration
COMMENT ON TABLE storage_audit_log IS 'Audit log for all storage operations (uploads, deletes, updates)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase Storage configuration completed successfully!';
  RAISE NOTICE '📦 Buckets created: event-images, event-videos, user-avatars, event-thumbnails, artist-banners, shorts-videos';
  RAISE NOTICE '🔒 RLS policies configured for all buckets';
  RAISE NOTICE '📊 Storage audit log and statistics views created';
  RAISE NOTICE '🎉 Storage is now secure and ready to use!';
END $$;
