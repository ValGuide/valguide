CREATE TABLE "studio"."organization_qr_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."short_link_daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_link_id" integer NOT NULL,
	"day" varchar(10) NOT NULL,
	"open_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_qr_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_qr_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
DROP INDEX "studio"."short_links_tour_target_uq";--> statement-breakpoint
DROP INDEX "studio"."short_links_stop_target_uq";--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "open_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "last_opened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."organization_qr_branding" ADD CONSTRAINT "organization_qr_branding_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_qr_branding" ADD CONSTRAINT "organization_qr_branding_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."short_link_daily_stats" ADD CONSTRAINT "short_link_daily_stats_short_link_id_short_links_id_fk" FOREIGN KEY ("short_link_id") REFERENCES "studio"."short_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_qr_branding" ADD CONSTRAINT "stop_qr_branding_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_qr_branding" ADD CONSTRAINT "stop_qr_branding_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_qr_branding" ADD CONSTRAINT "tour_qr_branding_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_qr_branding" ADD CONSTRAINT "tour_qr_branding_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_qr_branding_org_uq" ON "studio"."organization_qr_branding" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_link_daily_stats_short_link_day_uq" ON "studio"."short_link_daily_stats" USING btree ("short_link_id","day");--> statement-breakpoint
CREATE INDEX "short_link_daily_stats_short_link_idx" ON "studio"."short_link_daily_stats" USING btree ("short_link_id");--> statement-breakpoint
CREATE INDEX "short_link_daily_stats_day_idx" ON "studio"."short_link_daily_stats" USING btree ("day");--> statement-breakpoint
CREATE UNIQUE INDEX "stop_qr_branding_stop_uq" ON "studio"."stop_qr_branding" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_qr_branding_tour_uq" ON "studio"."tour_qr_branding" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_tour_target_uq" ON "studio"."short_links" USING btree ("type","tour_nano_id") WHERE "studio"."short_links"."type" = 'tour';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_stop_target_uq" ON "studio"."short_links" USING btree ("type","tour_nano_id","stop_nano_id") WHERE "studio"."short_links"."type" = 'stop';