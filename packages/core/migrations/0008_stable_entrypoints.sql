ALTER TABLE "studio"."short_links" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
UPDATE "studio"."short_links"
SET "organization_id" = "studio"."tour"."organization_id",
    "title" = COALESCE("studio"."short_links"."title", 'Tour QR')
FROM "studio"."tour"
WHERE "studio"."short_links"."type" = 'tour'
  AND "studio"."short_links"."tour_nano_id" = "studio"."tour"."nano_id";--> statement-breakpoint
UPDATE "studio"."short_links"
SET "organization_id" = "studio"."stop"."organization_id",
    "title" = COALESCE("studio"."short_links"."title", 'Stop QR')
FROM "studio"."stop"
WHERE "studio"."short_links"."type" = 'stop'
  AND "studio"."short_links"."stop_nano_id" = "studio"."stop"."nano_id";--> statement-breakpoint
UPDATE "studio"."short_links"
SET "title" = COALESCE("title", CASE
  WHEN "type" = 'external' THEN COALESCE("external_url", 'External link')
  WHEN "type" = 'landing_page' THEN COALESCE("page_slug", 'Landing page')
  WHEN "type" = 'campaign' THEN COALESCE("campaign_id", 'Campaign')
  ELSE "code"
END);--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD CONSTRAINT "short_links_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD CONSTRAINT "short_links_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD CONSTRAINT "short_links_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DROP INDEX "studio"."short_links_tour_target_uq";--> statement-breakpoint
DROP INDEX "studio"."short_links_stop_target_uq";--> statement-breakpoint
DROP INDEX "studio"."short_links_campaign_target_uq";--> statement-breakpoint
DROP INDEX "studio"."short_links_external_target_uq";--> statement-breakpoint
DROP INDEX "studio"."short_links_landing_target_uq";--> statement-breakpoint
CREATE INDEX "short_links_org_idx" ON "studio"."short_links" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "short_links_org_status_idx" ON "studio"."short_links" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_tour_target_uq" ON "studio"."short_links" USING btree ("organization_id","type","tour_nano_id") WHERE "studio"."short_links"."type" = 'tour';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_stop_target_uq" ON "studio"."short_links" USING btree ("organization_id","type","tour_nano_id","stop_nano_id") WHERE "studio"."short_links"."type" = 'stop';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_campaign_target_uq" ON "studio"."short_links" USING btree ("organization_id","type","campaign_id") WHERE "studio"."short_links"."type" = 'campaign';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_landing_target_uq" ON "studio"."short_links" USING btree ("organization_id","type","page_slug","locale") WHERE "studio"."short_links"."type" = 'landing_page';
