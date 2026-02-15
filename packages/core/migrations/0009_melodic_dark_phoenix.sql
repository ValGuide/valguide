-- Drop old RLS policies that matched on org-prefixed/user-prefixed path patterns
-- These are being replaced with namespace-based policies (assets/, orgs/, users/, feedback/)
DROP POLICY IF EXISTS "Users can upload to their org" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can read their org's files" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update their org's files" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can delete own uploads" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can upload to their own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can read their own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update their own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Feedback: users can upload to their folder" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Feedback: public read access" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "Feedback: users can delete own uploads" ON "storage"."objects";--> statement-breakpoint
CREATE POLICY "assets: owner can delete own uploads" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "assets: authenticated users can upload to assets namespace" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "assets: authenticated users can read assets namespace" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "assets: authenticated users can update assets namespace" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "feedback: owner can delete own uploads" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'studio-feedback' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "feedback: authenticated users can upload screenshots" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'studio-feedback' AND (storage.foldername(name))[1] = 'feedback');--> statement-breakpoint
CREATE POLICY "feedback: public read access" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon" USING (bucket_id = 'studio-feedback');--> statement-breakpoint
CREATE POLICY "orgs: owner can delete org logos" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can upload org logos" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can read org logos" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can update org logos" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "users: can delete own user namespace" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can upload to own user namespace" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can read own user namespace" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can update own user namespace" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text) WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);