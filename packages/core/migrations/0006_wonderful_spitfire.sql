ALTER TABLE "studio"."asset" DROP CONSTRAINT "asset_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."feedback" DROP CONSTRAINT "feedback_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop" DROP CONSTRAINT "stop_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop" DROP CONSTRAINT "stop_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour" DROP CONSTRAINT "tour_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour" DROP CONSTRAINT "tour_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."asset" ALTER COLUMN "uploaded_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."stop" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."stop" ALTER COLUMN "updated_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."tour" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."tour" ALTER COLUMN "updated_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;