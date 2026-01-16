ALTER TABLE "studio"."organization" ADD COLUMN "nano_id" varchar(21) NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD COLUMN "nano_id" varchar(21) NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."organization" ADD CONSTRAINT "unique_org_nano_id" UNIQUE("nano_id");--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "unique_theme_nano_id" UNIQUE("nano_id");