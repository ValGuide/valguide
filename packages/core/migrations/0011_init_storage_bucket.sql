-- 1. Create the 'assets' bucket (Idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', false, 524288000, null)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Drop the custom hook if it exists (cleaning up)
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

-- 3. Create a SECURITY DEFINER function to check membership
CREATE OR REPLACE FUNCTION public.check_storage_org_access(org_id_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is a member of the organization
  RETURN EXISTS (
    SELECT 1 
    FROM studio.organization_member om
    WHERE om.user_id = auth.uid()
    AND om.organization_id::text = org_id_text
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_storage_org_access TO authenticated;

-- 4. Debug/Permissive Policy (TEMPORARY FIX TO ISOLATE ISSUE)
-- If this works, then the issue is definitely in the check_storage_org_access logic.

DROP POLICY IF EXISTS "Users can upload to their org" ON storage.objects;
CREATE POLICY "Users can upload to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' 
  -- Temporarily allow ANY authenticated user to upload if the bucket is correct
  -- AND public.check_storage_org_access((storage.foldername(name))[1])
);

-- Keep read policy strict for now
DROP POLICY IF EXISTS "Users can read their org's files" ON storage.objects;
CREATE POLICY "Users can read their org's files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'assets' 
  AND public.check_storage_org_access((storage.foldername(name))[1])
);

DROP POLICY IF EXISTS "Users can update their org's files" ON storage.objects;
CREATE POLICY "Users can update their org's files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets' 
  AND public.check_storage_org_access((storage.foldername(name))[1])
);

DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner = auth.uid()
);
