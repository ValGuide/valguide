ALTER TABLE "studio"."organization_slug" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."tour_slug" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
-- Backfill existing slugs as published (they were created before draft/publish separation)
UPDATE "studio"."organization_slug" SET "published_at" = "created_at" WHERE "published_at" IS NULL;--> statement-breakpoint
UPDATE "studio"."tour_slug" SET "published_at" = "created_at" WHERE "published_at" IS NULL;