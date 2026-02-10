CREATE TABLE "studio"."organization_approved_domain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."organization_approved_domain" ADD CONSTRAINT "organization_approved_domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_approved_domain_unique" ON "studio"."organization_approved_domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "org_approved_domain_org_idx" ON "studio"."organization_approved_domain" USING btree ("organization_id");