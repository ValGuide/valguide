CREATE TYPE "public"."asset_type" AS ENUM('image', 'audio', 'video');--> statement-breakpoint
CREATE TYPE "studio"."short_link_type" AS ENUM('tour', 'stop', 'campaign', 'external', 'landing_page');--> statement-breakpoint
CREATE TYPE "studio"."org_role" AS ENUM('owner', 'admin', 'curator', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "studio"."user_status" AS ENUM('pending', 'approved', 'blocked');--> statement-breakpoint
CREATE TYPE "studio"."theme_preset" AS ENUM('angle', 'angle-dark', 'light', 'dark', 'blue', 'blue-dark', 'green', 'green-dark', 'purple', 'purple-dark', 'sage', 'sage-dark', 'stone', 'stone-dark', 'lavender', 'lavender-dark', 'sand', 'sand-dark', 'gallery', 'gallery-dark', 'curator', 'curator-dark', 'claude', 'claude-dark');--> statement-breakpoint
CREATE TABLE "studio"."asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"type" "asset_type" NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"width" integer,
	"height" integer,
	"duration" integer,
	"organization_id" uuid NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_asset_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
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
CREATE TABLE "studio"."short_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "studio"."short_link_type" NOT NULL,
	"locale" text,
	"tour_nano_id" text,
	"stop_nano_id" text,
	"campaign_id" text,
	"external_url" text,
	"page_slug" text,
	"target" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "studio"."organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo" text,
	"default_theme_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_org_nano_id" UNIQUE("nano_id"),
	CONSTRAINT "unique_org_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studio"."organization_approved_domain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"domain" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."organization_invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "studio"."org_role" DEFAULT 'editor' NOT NULL,
	"invited_by" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitation_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "studio"."organization_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "studio"."org_role" DEFAULT 'editor' NOT NULL,
	"is_owner" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "studio"."organization_slug" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"avatar_storage_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"onboarded_at" timestamp with time zone,
	"status" "studio"."user_status" DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp with time zone,
	"blocked_at" timestamp with time zone,
	"blocked_reason" text
);
--> statement-breakpoint
CREATE TABLE "studio"."theme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"base_preset" "studio"."theme_preset" NOT NULL,
	"colors" jsonb NOT NULL,
	"radius" numeric(3, 1) NOT NULL,
	"fonts" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "unique_theme_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"available_locales" text[] DEFAULT '{"en"}' NOT NULL,
	CONSTRAINT "unique_stop_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"locale" varchar(10),
	"position" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"locale" varchar(10),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_locale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500),
	"description" text,
	"transcription" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_locale_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500),
	"description" text,
	"transcription" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"coordinates" varchar(100),
	"settings_json" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_settings_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"coordinates" varchar(100),
	"settings_json" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"archived_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"available_locales" text[] DEFAULT '{"en"}' NOT NULL,
	CONSTRAINT "unique_tour_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"locale" varchar(10),
	"position" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_asset_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"locale" varchar(10),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_locale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500),
	"description" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_locale_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"theme_id" uuid,
	"settings_json" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_settings_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"theme_id" uuid,
	"settings_json" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_slug" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"stop_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."tour_stop_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"stop_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_team_id_organization_id_fk" FOREIGN KEY ("team_id") REFERENCES "studio"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_approved_domain" ADD CONSTRAINT "organization_approved_domain_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_slug" ADD CONSTRAINT "organization_slug_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset" ADD CONSTRAINT "stop_asset_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset_draft" ADD CONSTRAINT "stop_asset_draft_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale" ADD CONSTRAINT "stop_locale_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale" ADD CONSTRAINT "stop_locale_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" ADD CONSTRAINT "stop_locale_draft_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" ADD CONSTRAINT "stop_locale_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings" ADD CONSTRAINT "stop_settings_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings" ADD CONSTRAINT "stop_settings_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings_draft" ADD CONSTRAINT "stop_settings_draft_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_settings_draft" ADD CONSTRAINT "stop_settings_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour" ADD CONSTRAINT "tour_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_asset" ADD CONSTRAINT "tour_asset_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_asset_draft" ADD CONSTRAINT "tour_asset_draft_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale" ADD CONSTRAINT "tour_locale_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale" ADD CONSTRAINT "tour_locale_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale_draft" ADD CONSTRAINT "tour_locale_draft_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_locale_draft" ADD CONSTRAINT "tour_locale_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings" ADD CONSTRAINT "tour_settings_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings" ADD CONSTRAINT "tour_settings_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings_draft" ADD CONSTRAINT "tour_settings_draft_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_settings_draft" ADD CONSTRAINT "tour_settings_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_slug" ADD CONSTRAINT "tour_slug_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_slug" ADD CONSTRAINT "tour_slug_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_stop" ADD CONSTRAINT "tour_stop_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_stop" ADD CONSTRAINT "tour_stop_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_stop_draft" ADD CONSTRAINT "tour_stop_draft_tour_id_tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "studio"."tour"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."tour_stop_draft" ADD CONSTRAINT "tour_stop_draft_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_org_idx" ON "studio"."asset" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "asset_type_org_idx" ON "studio"."asset" USING btree ("type","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_code_uq" ON "studio"."short_links" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_tour_target_uq" ON "studio"."short_links" USING btree ("type","tour_nano_id","locale") WHERE "studio"."short_links"."type" = 'tour';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_stop_target_uq" ON "studio"."short_links" USING btree ("type","tour_nano_id","stop_nano_id","locale") WHERE "studio"."short_links"."type" = 'stop';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_campaign_target_uq" ON "studio"."short_links" USING btree ("type","campaign_id") WHERE "studio"."short_links"."type" = 'campaign';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_external_target_uq" ON "studio"."short_links" USING btree ("type","external_url") WHERE "studio"."short_links"."type" = 'external';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_landing_target_uq" ON "studio"."short_links" USING btree ("type","page_slug","locale") WHERE "studio"."short_links"."type" = 'landing_page';--> statement-breakpoint
CREATE INDEX "short_links_tour_idx" ON "studio"."short_links" USING btree ("tour_nano_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_approved_domain_unique" ON "studio"."organization_approved_domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "org_approved_domain_org_idx" ON "studio"."organization_approved_domain" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_invite_email_idx" ON "studio"."organization_invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "org_invite_org_id_idx" ON "studio"."organization_invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_unique" ON "studio"."organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "org_member_user_id_idx" ON "studio"."organization_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_member_org_user_idx" ON "studio"."organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_unique" ON "studio"."organization_slug" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_slug_org_idx" ON "studio"."organization_slug" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_unique_name_per_org" ON "studio"."theme" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "theme_org_idx" ON "studio"."theme" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "stop_org_idx" ON "studio"."stop" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_asset" ON "studio"."stop_asset" USING btree ("stop_id","asset_id","channel","locale");--> statement-breakpoint
CREATE INDEX "stop_asset_stop_idx" ON "studio"."stop_asset" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_asset_channel_idx" ON "studio"."stop_asset" USING btree ("stop_id","channel");--> statement-breakpoint
CREATE INDEX "stop_asset_asset_idx" ON "studio"."stop_asset" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_asset_draft" ON "studio"."stop_asset_draft" USING btree ("stop_id","asset_id","channel","locale");--> statement-breakpoint
CREATE INDEX "stop_asset_draft_stop_idx" ON "studio"."stop_asset_draft" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_asset_draft_channel_idx" ON "studio"."stop_asset_draft" USING btree ("stop_id","channel");--> statement-breakpoint
CREATE INDEX "stop_asset_draft_asset_idx" ON "studio"."stop_asset_draft" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_locale" ON "studio"."stop_locale" USING btree ("stop_id","locale");--> statement-breakpoint
CREATE INDEX "stop_locale_stop_idx" ON "studio"."stop_locale" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_locale_draft" ON "studio"."stop_locale_draft" USING btree ("stop_id","locale");--> statement-breakpoint
CREATE INDEX "stop_locale_draft_stop_idx" ON "studio"."stop_locale_draft" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_settings" ON "studio"."stop_settings" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_settings_draft" ON "studio"."stop_settings_draft" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "tour_org_idx" ON "studio"."tour" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_org_slug_unique" ON "studio"."tour" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_asset" ON "studio"."tour_asset" USING btree ("tour_id","asset_id","channel","locale");--> statement-breakpoint
CREATE INDEX "tour_asset_tour_idx" ON "studio"."tour_asset" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_asset_channel_idx" ON "studio"."tour_asset" USING btree ("tour_id","channel");--> statement-breakpoint
CREATE INDEX "tour_asset_asset_idx" ON "studio"."tour_asset" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_asset_draft" ON "studio"."tour_asset_draft" USING btree ("tour_id","asset_id","channel","locale");--> statement-breakpoint
CREATE INDEX "tour_asset_draft_tour_idx" ON "studio"."tour_asset_draft" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_asset_draft_channel_idx" ON "studio"."tour_asset_draft" USING btree ("tour_id","channel");--> statement-breakpoint
CREATE INDEX "tour_asset_draft_asset_idx" ON "studio"."tour_asset_draft" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_locale" ON "studio"."tour_locale" USING btree ("tour_id","locale");--> statement-breakpoint
CREATE INDEX "tour_locale_tour_idx" ON "studio"."tour_locale" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_locale_draft" ON "studio"."tour_locale_draft" USING btree ("tour_id","locale");--> statement-breakpoint
CREATE INDEX "tour_locale_draft_tour_idx" ON "studio"."tour_locale_draft" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_settings" ON "studio"."tour_settings" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_settings_draft" ON "studio"."tour_settings_draft" USING btree ("tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_slug_org_unique" ON "studio"."tour_slug" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "tour_slug_tour_idx" ON "studio"."tour_slug" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_slug_lookup_idx" ON "studio"."tour_slug" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_stop" ON "studio"."tour_stop" USING btree ("tour_id","stop_id");--> statement-breakpoint
CREATE INDEX "tour_stop_tour_idx" ON "studio"."tour_stop" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_stop_stop_idx" ON "studio"."tour_stop" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "tour_stop_position_idx" ON "studio"."tour_stop" USING btree ("tour_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tour_stop_draft" ON "studio"."tour_stop_draft" USING btree ("tour_id","stop_id");--> statement-breakpoint
CREATE INDEX "tour_stop_draft_tour_idx" ON "studio"."tour_stop_draft" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_stop_draft_stop_idx" ON "studio"."tour_stop_draft" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "tour_stop_draft_position_idx" ON "studio"."tour_stop_draft" USING btree ("tour_id","position");--> statement-breakpoint
CREATE POLICY "assets: owner can delete own uploads" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "assets: authenticated users can upload to assets namespace" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "assets: authenticated users can read assets namespace" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "assets: authenticated users can update assets namespace" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets');--> statement-breakpoint
CREATE POLICY "feedback: owner can delete own uploads" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'studio-feedback' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "feedback: authenticated users can upload screenshots" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'studio-feedback' AND (storage.foldername(name))[1] = 'feedback');--> statement-breakpoint
CREATE POLICY "feedback: public read access" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon" USING (bucket_id = 'studio-feedback');--> statement-breakpoint
CREATE POLICY "orgs: owner can delete org logos" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs' AND owner = auth.uid());--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can upload org logos" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can read org logos" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "orgs: authenticated users can update org logos" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs');--> statement-breakpoint
CREATE POLICY "users: can delete own user namespace" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can upload to own user namespace" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can read own user namespace" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);--> statement-breakpoint
CREATE POLICY "users: can update own user namespace" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text) WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text);