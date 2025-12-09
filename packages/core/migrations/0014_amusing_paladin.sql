ALTER TABLE "studio"."custom_theme" RENAME TO "theme";--> statement-breakpoint
ALTER TABLE "studio"."theme" DROP CONSTRAINT "custom_theme_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."theme" DROP CONSTRAINT "custom_theme_created_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "studio"."custom_theme_unique_name_per_org";--> statement-breakpoint
DROP INDEX "studio"."custom_theme_org_idx";--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "theme_unique_name_per_org" ON "studio"."theme" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "theme_org_idx" ON "studio"."theme" USING btree ("organization_id");