-- Drop Supabase Storage RLS policies (storage migrated to Cloudflare R2)
DROP POLICY IF EXISTS "assets: owner can delete own uploads" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "assets: authenticated users can upload to assets namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "assets: authenticated users can read assets namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "assets: authenticated users can update assets namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "feedback: owner can delete own uploads" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "feedback: authenticated users can upload screenshots" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "feedback: public read access" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "orgs: owner can delete org logos" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "orgs: authenticated users can upload org logos" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "orgs: authenticated users can read org logos" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "orgs: authenticated users can update org logos" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "users: can delete own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "users: can upload to own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "users: can read own user namespace" ON "storage"."objects";--> statement-breakpoint
DROP POLICY IF EXISTS "users: can update own user namespace" ON "storage"."objects";
