CREATE TYPE "studio"."theme_ai_generation_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "studio"."theme_ai_generation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"source_url" text,
	"notes" text,
	"input_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"website_context" jsonb,
	"visual_analysis" text,
	"generated_theme" jsonb,
	"status" "studio"."theme_ai_generation_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "unique_theme_ai_generation_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
ALTER TABLE "studio"."theme_ai_generation" ADD CONSTRAINT "theme_ai_generation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme_ai_generation" ADD CONSTRAINT "theme_ai_generation_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "theme_ai_generation_org_idx" ON "studio"."theme_ai_generation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "theme_ai_generation_created_at_idx" ON "studio"."theme_ai_generation" USING btree ("created_at");
