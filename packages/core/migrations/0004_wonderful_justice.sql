CREATE TABLE "auth"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."asset" DROP CONSTRAINT "asset_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."feedback" DROP CONSTRAINT "feedback_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" DROP CONSTRAINT "organization_invitation_invited_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."organization_member" DROP CONSTRAINT "organization_member_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."profiles" DROP CONSTRAINT "profiles_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."theme" DROP CONSTRAINT "theme_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop" DROP CONSTRAINT "stop_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop" DROP CONSTRAINT "stop_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop_locale" DROP CONSTRAINT "stop_locale_published_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" DROP CONSTRAINT "stop_locale_draft_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop_settings" DROP CONSTRAINT "stop_settings_published_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."stop_settings_draft" DROP CONSTRAINT "stop_settings_draft_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour" DROP CONSTRAINT "tour_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour" DROP CONSTRAINT "tour_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour_locale" DROP CONSTRAINT "tour_locale_published_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour_locale_draft" DROP CONSTRAINT "tour_locale_draft_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour_settings" DROP CONSTRAINT "tour_settings_published_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio"."tour_settings_draft" DROP CONSTRAINT "tour_settings_draft_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_account_provider_account_unique" ON "auth"."account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "auth_account_user_id_idx" ON "auth"."account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_session_token_unique" ON "auth"."session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "auth_session_user_id_idx" ON "auth"."session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_user_email_unique" ON "auth"."user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_verification_identifier_value_unique" ON "auth"."verification" USING btree ("identifier","value");--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD CONSTRAINT "profiles_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale" ADD CONSTRAINT "stop_locale_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" ADD CONSTRAINT "stop_locale_draft_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings" ADD CONSTRAINT "stop_settings_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings_draft" ADD CONSTRAINT "stop_settings_draft_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale" ADD CONSTRAINT "tour_locale_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale_draft" ADD CONSTRAINT "tour_locale_draft_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings" ADD CONSTRAINT "tour_settings_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings_draft" ADD CONSTRAINT "tour_settings_draft_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;