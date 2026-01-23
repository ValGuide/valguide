ALTER TABLE "studio"."guide_stop" ADD COLUMN "visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD COLUMN "archived_at" timestamp with time zone;