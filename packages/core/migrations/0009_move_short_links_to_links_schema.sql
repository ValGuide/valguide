CREATE SCHEMA IF NOT EXISTS "links";--> statement-breakpoint
ALTER TYPE "studio"."short_link_type" SET SCHEMA "links";--> statement-breakpoint
ALTER TABLE "studio"."short_links" SET SCHEMA "links";--> statement-breakpoint
ALTER TABLE "studio"."short_link_daily_stats" SET SCHEMA "links";
