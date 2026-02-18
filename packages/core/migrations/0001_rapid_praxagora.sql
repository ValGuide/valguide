ALTER TABLE "studio"."organization_approved_domain" RENAME TO "approved_domain";--> statement-breakpoint
ALTER TABLE "studio"."approved_domain" DROP CONSTRAINT "organization_approved_domain_organization_id_organization_id_fk";
--> statement-breakpoint
DROP INDEX "studio"."org_approved_domain_unique";--> statement-breakpoint
DROP INDEX "studio"."org_approved_domain_org_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "approved_domain_unique" ON "studio"."approved_domain" USING btree ("domain");--> statement-breakpoint
ALTER TABLE "studio"."approved_domain" DROP COLUMN "organization_id";