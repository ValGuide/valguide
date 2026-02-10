-- 1. Create the 'assets' bucket
-- We use ON CONFLICT to make it idempotent (safe to run multiple times)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', false, 524288000, null) -- 500MB limit
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Create the 'studio-feedback' bucket (public for direct URL access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-feedback', 
  'studio-feedback', 
  true,  -- Public bucket for direct URLs
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable Row Level Security on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- We drop existing policies first to ensure we can recreate them with the latest definition

-- Policy: Users can upload files to their organization's folder
DROP POLICY IF EXISTS "Users can upload to their org" ON storage.objects;
CREATE POLICY "Users can upload to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can read files from their organization
DROP POLICY IF EXISTS "Users can read their org's files" ON storage.objects;
CREATE POLICY "Users can read their org's files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can update files from their organization
DROP POLICY IF EXISTS "Users can update their org's files" ON storage.objects;
CREATE POLICY "Users can update their org's files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can delete their own uploads
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);

-- Policy: Users can upload to their own user namespace
DROP POLICY IF EXISTS "Users can upload to their own user namespace" ON storage.objects;
CREATE POLICY "Users can upload to their own user namespace"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can read their own user namespace
DROP POLICY IF EXISTS "Users can read their own user namespace" ON storage.objects;
CREATE POLICY "Users can read their own user namespace"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can update their own user namespace
DROP POLICY IF EXISTS "Users can update their own user namespace" ON storage.objects;
CREATE POLICY "Users can update their own user namespace"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

  -- =============================================================================
  -- Feedback Attachments Bucket Policies
  -- =============================================================================

  -- Policy: Authenticated users can upload to their own folder
  DROP POLICY IF EXISTS "Feedback: users can upload to their folder" ON storage.objects;
  CREATE POLICY "Feedback: users can upload to their folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studio-feedback'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

  -- Policy: Anyone can read (public bucket)
  DROP POLICY IF EXISTS "Feedback: public read access" ON storage.objects;
  CREATE POLICY "Feedback: public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'studio-feedback');

  -- Policy: Users can delete their own feedback attachments
  DROP POLICY IF EXISTS "Feedback: users can delete own uploads" ON storage.objects;
  CREATE POLICY "Feedback: users can delete own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'studio-feedback'
    AND owner = auth.uid()
  );
