CREATE TABLE "studio"."feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"screenshot_url" text,
	"screenshot_path" text,
	"page_url" text,
	"team_id" uuid,
	"user_email" text NOT NULL,
	"user_name" text,
	"team_name" text,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."guide" ALTER COLUMN "available_locales" SET DEFAULT '{"en"}';--> statement-breakpoint
ALTER TABLE "studio"."stop" ALTER COLUMN "available_locales" SET DEFAULT '{"en"}';--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_team_id_organization_id_fk" FOREIGN KEY ("team_id") REFERENCES "studio"."organization"("id") ON DELETE set null ON UPDATE no action;