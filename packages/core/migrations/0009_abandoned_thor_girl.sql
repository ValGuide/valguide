ALTER TABLE "organization" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."organization" SET SCHEMA "studio";
--> statement-breakpoint
ALTER TABLE "public"."organization_invitation" SET SCHEMA "studio";
--> statement-breakpoint
ALTER TABLE "public"."organization_member" SET SCHEMA "studio";
--> statement-breakpoint
ALTER TABLE "studio"."guide" DROP CONSTRAINT "guide_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;