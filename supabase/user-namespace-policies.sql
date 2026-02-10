-- User-scoped namespace policies for the 'assets' bucket
-- Path: users/{userId}/...
-- Allows authenticated users to manage their own personal files (e.g., profile avatars)

DROP POLICY IF EXISTS "Users can upload to their own user namespace" ON storage.objects;
CREATE POLICY "Users can upload to their own user namespace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can read their own user namespace" ON storage.objects;
CREATE POLICY "Users can read their own user namespace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own user namespace" ON storage.objects;
CREATE POLICY "Users can update their own user namespace"
ON storage.objects FOR UPDATE TO authenticated
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
