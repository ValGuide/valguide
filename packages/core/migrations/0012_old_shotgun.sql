-- Phase 1: Create guide_stop junction table
CREATE TABLE "studio"."guide_stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"stop_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign keys and indexes for guide_stop
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_stop" ON "studio"."guide_stop" USING btree ("guide_id","stop_id");
--> statement-breakpoint
CREATE INDEX "guide_stop_guide_idx" ON "studio"."guide_stop" USING btree ("guide_id");
--> statement-breakpoint
CREATE INDEX "guide_stop_stop_idx" ON "studio"."guide_stop" USING btree ("stop_id");
--> statement-breakpoint

-- Phase 2: Add organization_id column as nullable first
ALTER TABLE "studio"."stop" ADD COLUMN "organization_id" uuid;
--> statement-breakpoint

-- Backfill organization_id from guide.organization_id
UPDATE "studio"."stop" s
SET organization_id = g.organization_id
FROM "studio"."guide" g
WHERE s.guide_id = g.id;
--> statement-breakpoint

-- Backfill guide_stop junction table from existing stop.guide_id and stop.order
INSERT INTO "studio"."guide_stop" (id, guide_id, stop_id, position, created_at)
SELECT 
  gen_random_uuid(),
  s.guide_id,
  s.id,
  COALESCE(s.order, 0),
  now()
FROM "studio"."stop" s
WHERE s.guide_id IS NOT NULL;
--> statement-breakpoint

-- Now make organization_id NOT NULL after backfill
ALTER TABLE "studio"."stop" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint

-- Add foreign key and index for organization_id
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "stop_organization_id_idx" ON "studio"."stop" USING btree ("organization_id");
--> statement-breakpoint

-- Phase 5: Make guide_id nullable and change cascade behavior
ALTER TABLE "studio"."stop" DROP CONSTRAINT "stop_guide_id_guide_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop" ALTER COLUMN "guide_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "studio"."stop" ALTER COLUMN "order" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE set null ON UPDATE no action;
