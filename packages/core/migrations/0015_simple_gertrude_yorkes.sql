CREATE TYPE "public"."short_link_type" AS ENUM('guide', 'stop', 'campaign', 'external', 'landing_page');--> statement-breakpoint
ALTER TABLE "studio"."short_links" DROP CONSTRAINT "unique_link_short_code";--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "type" "short_link_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "locale" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "guide_nano_id" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "stop_nano_id" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "campaign_id" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "external_url" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "page_slug" text;--> statement-breakpoint
ALTER TABLE "studio"."short_links" ADD COLUMN "target" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_code_uq" ON "studio"."short_links" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_guide_target_uq" ON "studio"."short_links" USING btree ("type","guide_nano_id","locale") WHERE "studio"."short_links"."type" = 'guide';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_stop_target_uq" ON "studio"."short_links" USING btree ("type","guide_nano_id","stop_nano_id","locale") WHERE "studio"."short_links"."type" = 'stop';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_campaign_target_uq" ON "studio"."short_links" USING btree ("type","campaign_id") WHERE "studio"."short_links"."type" = 'campaign';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_external_target_uq" ON "studio"."short_links" USING btree ("type","external_url") WHERE "studio"."short_links"."type" = 'external';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_landing_target_uq" ON "studio"."short_links" USING btree ("type","page_slug","locale") WHERE "studio"."short_links"."type" = 'landing_page';--> statement-breakpoint
CREATE INDEX "short_links_guide_idx" ON "studio"."short_links" USING btree ("guide_nano_id");--> statement-breakpoint
ALTER TABLE "studio"."short_links" DROP COLUMN "url";