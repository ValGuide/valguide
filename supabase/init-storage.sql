-- 1. Create the 'assets' bucket
-- We use ON CONFLICT to make it idempotent (safe to run multiple times)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', false, 524288000, null) -- 500MB limit
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

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
