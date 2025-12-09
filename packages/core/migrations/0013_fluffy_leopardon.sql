CREATE TYPE "public"."theme_preset" AS ENUM('light', 'dark', 'blue', 'blue-dark', 'green', 'green-dark', 'purple', 'purple-dark');--> statement-breakpoint
CREATE TABLE "studio"."custom_theme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"base_preset" "theme_preset" NOT NULL,
	"colors" jsonb NOT NULL,
	"radius" numeric(3, 1) NOT NULL,
	"fonts" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."organization" ADD COLUMN "default_theme_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."custom_theme" ADD CONSTRAINT "custom_theme_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."custom_theme" ADD CONSTRAINT "custom_theme_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "custom_theme_unique_name_per_org" ON "studio"."custom_theme" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "custom_theme_org_idx" ON "studio"."custom_theme" USING btree ("organization_id");