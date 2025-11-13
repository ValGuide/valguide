DO $$ BEGIN
 CREATE TYPE "public"."translation_status" AS ENUM('draft', 'in_review', 'published', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE "studio"."guide_translation_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "translation_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_translation_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "translation_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"transcription" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" ADD COLUMN "current_version_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" ADD COLUMN "draft_version_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" ADD COLUMN "current_version_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" ADD COLUMN "draft_version_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation_version" ADD CONSTRAINT "guide_translation_version_translation_id_guide_translation_id_fk" FOREIGN KEY ("translation_id") REFERENCES "studio"."guide_translation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation_version" ADD CONSTRAINT "guide_translation_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation_version" ADD CONSTRAINT "stop_translation_version_translation_id_stop_translation_id_fk" FOREIGN KEY ("translation_id") REFERENCES "studio"."stop_translation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation_version" ADD CONSTRAINT "stop_translation_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_guide_translation_version" ON "studio"."guide_translation_version" USING btree ("translation_id","version");--> statement-breakpoint
CREATE INDEX "guide_translation_version_status_idx" ON "studio"."guide_translation_version" USING btree ("translation_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_stop_translation_version" ON "studio"."stop_translation_version" USING btree ("translation_id","version");--> statement-breakpoint
CREATE INDEX "stop_translation_version_status_idx" ON "studio"."stop_translation_version" USING btree ("translation_id","status");--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" DROP COLUMN IF EXISTS "transcription";