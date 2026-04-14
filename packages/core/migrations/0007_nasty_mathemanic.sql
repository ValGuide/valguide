CREATE SCHEMA IF NOT EXISTS "analytics";--> statement-breakpoint
CREATE TYPE "public"."guide_analytics_event_type" AS ENUM('tour_opened', 'stop_opened', 'audio_played');--> statement-breakpoint
CREATE TABLE "analytics"."event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"tour_id" uuid NOT NULL,
	"stop_id" uuid,
	"visitor_id" varchar(64) NOT NULL,
	"event_type" "guide_analytics_event_type" NOT NULL,
	"locale" varchar(10),
	"path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics"."event" ADD CONSTRAINT "event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."event" ADD CONSTRAINT "event_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics"."event" ADD CONSTRAINT "event_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_event_org_created_idx" ON "analytics"."event" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_event_tour_created_idx" ON "analytics"."event" USING btree ("tour_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_event_type_created_idx" ON "analytics"."event" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "analytics_event_visitor_idx" ON "analytics"."event" USING btree ("visitor_id");
