-- Supabase Storage RLS Policies for valguide-assets bucket
-- Run these commands in Supabase SQL Editor after creating the bucket

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their organization's folder
CREATE POLICY "Users can upload to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'valguide-assets' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can read files from their organization
CREATE POLICY "Users can read their org's files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'valguide-assets'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can update files from their organization
CREATE POLICY "Users can update their org's files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'valguide-assets'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'valguide-assets'
  AND owner = auth.uid()
);

-- Alternative: Allow users to delete any file in their org (if needed)
-- CREATE POLICY "Users can delete org files"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'valguide-assets'
--   AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text
-- );
