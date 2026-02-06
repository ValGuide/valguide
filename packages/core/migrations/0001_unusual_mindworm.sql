CREATE TABLE "studio"."organization_slug" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_slug" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."organization_slug" ADD CONSTRAINT "organization_slug_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_slug" ADD CONSTRAINT "tour_slug_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_slug" ADD CONSTRAINT "tour_slug_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_unique" ON "studio"."organization_slug" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_primary_unique" ON "studio"."organization_slug" USING btree ("organization_id") WHERE "studio"."organization_slug"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "organization_slug_org_idx" ON "studio"."organization_slug" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_slug_org_unique" ON "studio"."tour_slug" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_slug_primary_unique" ON "studio"."tour_slug" USING btree ("tour_id") WHERE "studio"."tour_slug"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "tour_slug_tour_idx" ON "studio"."tour_slug" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_slug_lookup_idx" ON "studio"."tour_slug" USING btree ("organization_id","slug");