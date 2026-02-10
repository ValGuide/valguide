CREATE TYPE "studio"."user_status" AS ENUM('pending', 'approved', 'blocked');--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD COLUMN "status" "studio"."user_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD COLUMN "blocked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD COLUMN "blocked_reason" text;