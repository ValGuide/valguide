CREATE TYPE "public"."asset_type" AS ENUM('image', 'audio', 'video');--> statement-breakpoint
CREATE TYPE "studio"."short_link_type" AS ENUM('guide', 'stop', 'campaign', 'external', 'landing_page');--> statement-breakpoint
CREATE TYPE "studio"."org_role" AS ENUM('owner', 'admin', 'curator', 'editor', 'viewer');--> statement-breakpoint
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
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_asset_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."asset_set_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_table" varchar(20) NOT NULL,
	"scope_id" uuid NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."asset_set_draft_item" (
	"draft_set_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "pk_asset_set_draft_item" PRIMARY KEY("draft_set_id","asset_id","position")
);
--> statement-breakpoint
CREATE TABLE "studio"."asset_set_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_table" varchar(20) NOT NULL,
	"scope_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."asset_set_version_item" (
	"version_set_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "pk_asset_set_version_item" PRIMARY KEY("version_set_id","asset_id","position")
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_asset_scope" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"locale" varchar(10),
	"channel" varchar(120) NOT NULL,
	"draft_set_id" uuid NOT NULL,
	"published_set_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset_scope" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10),
	"channel" varchar(120) NOT NULL,
	"draft_set_id" uuid NOT NULL,
	"published_set_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "studio"."guide" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"available_locales" text[] DEFAULT '{"en"}' NOT NULL,
	"theme_id" uuid,
	CONSTRAINT "unique_guide_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_core" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"draft_id" uuid NOT NULL,
	"published_version_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_core_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_core_id" uuid NOT NULL,
	"audience_tags" text[],
	"duration_seconds" integer,
	"difficulty" varchar(50),
	"settings_json" text,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_core_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_core_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"audience_tags" text[],
	"duration_seconds" integer,
	"difficulty" varchar(50),
	"settings_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_locale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"draft_id" uuid NOT NULL,
	"published_version_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_locale_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_locale_id" uuid NOT NULL,
	"title" varchar(500),
	"description" text,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_locale_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_locale_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(500),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"stop_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"available_locales" text[] DEFAULT '{"en"}' NOT NULL,
	CONSTRAINT "unique_stop_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_core" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"draft_id" uuid NOT NULL,
	"published_version_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_core_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_core_id" uuid NOT NULL,
	"coordinates" varchar(100),
	"settings_json" text,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_core_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_core_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"coordinates" varchar(100),
	"settings_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_locale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"draft_id" uuid NOT NULL,
	"published_version_id" uuid,
	"last_published_draft_revision" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_locale_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_locale_id" uuid NOT NULL,
	"title" varchar(500),
	"description" text,
	"transcription" text,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_locale_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_locale_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(500),
	"description" text,
	"transcription" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."short_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "studio"."short_link_type" NOT NULL,
	"locale" text,
	"guide_nano_id" text,
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
	"logo" text,
	"default_theme_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_org_nano_id" UNIQUE("nano_id")
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
CREATE TABLE "studio"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"onboarded_at" timestamp with time zone
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
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_draft" ADD CONSTRAINT "asset_set_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_draft_item" ADD CONSTRAINT "asset_set_draft_item_draft_set_id_asset_set_draft_id_fk" FOREIGN KEY ("draft_set_id") REFERENCES "studio"."asset_set_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_draft_item" ADD CONSTRAINT "asset_set_draft_item_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_version" ADD CONSTRAINT "asset_set_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_version_item" ADD CONSTRAINT "asset_set_version_item_version_set_id_asset_set_version_id_fk" FOREIGN KEY ("version_set_id") REFERENCES "studio"."asset_set_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset_set_version_item" ADD CONSTRAINT "asset_set_version_item_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset_scope" ADD CONSTRAINT "guide_asset_scope_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset_scope" ADD CONSTRAINT "stop_asset_scope_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."feedback" ADD CONSTRAINT "feedback_team_id_organization_id_fk" FOREIGN KEY ("team_id") REFERENCES "studio"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_core" ADD CONSTRAINT "guide_core_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_core_draft" ADD CONSTRAINT "guide_core_draft_guide_core_id_guide_core_id_fk" FOREIGN KEY ("guide_core_id") REFERENCES "studio"."guide_core"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_core_draft" ADD CONSTRAINT "guide_core_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_core_version" ADD CONSTRAINT "guide_core_version_guide_core_id_guide_core_id_fk" FOREIGN KEY ("guide_core_id") REFERENCES "studio"."guide_core"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_core_version" ADD CONSTRAINT "guide_core_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_locale" ADD CONSTRAINT "guide_locale_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_locale_draft" ADD CONSTRAINT "guide_locale_draft_guide_locale_id_guide_locale_id_fk" FOREIGN KEY ("guide_locale_id") REFERENCES "studio"."guide_locale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_locale_draft" ADD CONSTRAINT "guide_locale_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_locale_version" ADD CONSTRAINT "guide_locale_version_guide_locale_id_guide_locale_id_fk" FOREIGN KEY ("guide_locale_id") REFERENCES "studio"."guide_locale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_locale_version" ADD CONSTRAINT "guide_locale_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_core" ADD CONSTRAINT "stop_core_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_core_draft" ADD CONSTRAINT "stop_core_draft_stop_core_id_stop_core_id_fk" FOREIGN KEY ("stop_core_id") REFERENCES "studio"."stop_core"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_core_draft" ADD CONSTRAINT "stop_core_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_core_version" ADD CONSTRAINT "stop_core_version_stop_core_id_stop_core_id_fk" FOREIGN KEY ("stop_core_id") REFERENCES "studio"."stop_core"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_core_version" ADD CONSTRAINT "stop_core_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale" ADD CONSTRAINT "stop_locale_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" ADD CONSTRAINT "stop_locale_draft_stop_locale_id_stop_locale_id_fk" FOREIGN KEY ("stop_locale_id") REFERENCES "studio"."stop_locale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_draft" ADD CONSTRAINT "stop_locale_draft_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_version" ADD CONSTRAINT "stop_locale_version_stop_locale_id_stop_locale_id_fk" FOREIGN KEY ("stop_locale_id") REFERENCES "studio"."stop_locale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_locale_version" ADD CONSTRAINT "stop_locale_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_org_idx" ON "studio"."asset" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "asset_type_org_idx" ON "studio"."asset" USING btree ("type","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_asset_set_draft_per_scope" ON "studio"."asset_set_draft" USING btree ("scope_table","scope_id");--> statement-breakpoint
CREATE INDEX "asset_set_draft_scope_idx" ON "studio"."asset_set_draft" USING btree ("scope_table","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_asset_set_draft_item_position" ON "studio"."asset_set_draft_item" USING btree ("draft_set_id","position");--> statement-breakpoint
CREATE INDEX "asset_set_draft_item_draft_idx" ON "studio"."asset_set_draft_item" USING btree ("draft_set_id");--> statement-breakpoint
CREATE INDEX "asset_set_draft_item_asset_idx" ON "studio"."asset_set_draft_item" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_asset_set_version_per_scope" ON "studio"."asset_set_version" USING btree ("scope_table","scope_id","version");--> statement-breakpoint
CREATE INDEX "asset_set_version_scope_idx" ON "studio"."asset_set_version" USING btree ("scope_table","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_asset_set_version_item_position" ON "studio"."asset_set_version_item" USING btree ("version_set_id","position");--> statement-breakpoint
CREATE INDEX "asset_set_version_item_version_idx" ON "studio"."asset_set_version_item" USING btree ("version_set_id");--> statement-breakpoint
CREATE INDEX "asset_set_version_item_asset_idx" ON "studio"."asset_set_version_item" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_asset_scope" ON "studio"."guide_asset_scope" USING btree ("guide_id","locale","channel");--> statement-breakpoint
CREATE INDEX "guide_asset_scope_guide_idx" ON "studio"."guide_asset_scope" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_asset_scope_channel_idx" ON "studio"."guide_asset_scope" USING btree ("channel");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_asset_scope" ON "studio"."stop_asset_scope" USING btree ("stop_id","locale","channel");--> statement-breakpoint
CREATE INDEX "stop_asset_scope_stop_idx" ON "studio"."stop_asset_scope" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_asset_scope_channel_idx" ON "studio"."stop_asset_scope" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "guide_org_idx" ON "studio"."guide" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_core" ON "studio"."guide_core" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_core_guide_idx" ON "studio"."guide_core" USING btree ("guide_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_core_draft" ON "studio"."guide_core_draft" USING btree ("guide_core_id");--> statement-breakpoint
CREATE INDEX "guide_core_draft_core_idx" ON "studio"."guide_core_draft" USING btree ("guide_core_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_core_version" ON "studio"."guide_core_version" USING btree ("guide_core_id","version");--> statement-breakpoint
CREATE INDEX "guide_core_version_core_idx" ON "studio"."guide_core_version" USING btree ("guide_core_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_locale" ON "studio"."guide_locale" USING btree ("guide_id","locale");--> statement-breakpoint
CREATE INDEX "guide_locale_guide_idx" ON "studio"."guide_locale" USING btree ("guide_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_locale_draft" ON "studio"."guide_locale_draft" USING btree ("guide_locale_id");--> statement-breakpoint
CREATE INDEX "guide_locale_draft_locale_idx" ON "studio"."guide_locale_draft" USING btree ("guide_locale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_locale_version" ON "studio"."guide_locale_version" USING btree ("guide_locale_id","version");--> statement-breakpoint
CREATE INDEX "guide_locale_version_locale_idx" ON "studio"."guide_locale_version" USING btree ("guide_locale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_stop" ON "studio"."guide_stop" USING btree ("guide_id","stop_id");--> statement-breakpoint
CREATE INDEX "guide_stop_guide_idx" ON "studio"."guide_stop" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_stop_stop_idx" ON "studio"."guide_stop" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_org_idx" ON "studio"."stop" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_core" ON "studio"."stop_core" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_core_stop_idx" ON "studio"."stop_core" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_core_draft" ON "studio"."stop_core_draft" USING btree ("stop_core_id");--> statement-breakpoint
CREATE INDEX "stop_core_draft_core_idx" ON "studio"."stop_core_draft" USING btree ("stop_core_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_core_version" ON "studio"."stop_core_version" USING btree ("stop_core_id","version");--> statement-breakpoint
CREATE INDEX "stop_core_version_core_idx" ON "studio"."stop_core_version" USING btree ("stop_core_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_locale" ON "studio"."stop_locale" USING btree ("stop_id","locale");--> statement-breakpoint
CREATE INDEX "stop_locale_stop_idx" ON "studio"."stop_locale" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_locale_draft" ON "studio"."stop_locale_draft" USING btree ("stop_locale_id");--> statement-breakpoint
CREATE INDEX "stop_locale_draft_locale_idx" ON "studio"."stop_locale_draft" USING btree ("stop_locale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_stop_locale_version" ON "studio"."stop_locale_version" USING btree ("stop_locale_id","version");--> statement-breakpoint
CREATE INDEX "stop_locale_version_locale_idx" ON "studio"."stop_locale_version" USING btree ("stop_locale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_code_uq" ON "studio"."short_links" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_guide_target_uq" ON "studio"."short_links" USING btree ("type","guide_nano_id","locale") WHERE "studio"."short_links"."type" = 'guide';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_stop_target_uq" ON "studio"."short_links" USING btree ("type","guide_nano_id","stop_nano_id","locale") WHERE "studio"."short_links"."type" = 'stop';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_campaign_target_uq" ON "studio"."short_links" USING btree ("type","campaign_id") WHERE "studio"."short_links"."type" = 'campaign';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_external_target_uq" ON "studio"."short_links" USING btree ("type","external_url") WHERE "studio"."short_links"."type" = 'external';--> statement-breakpoint
CREATE UNIQUE INDEX "short_links_landing_target_uq" ON "studio"."short_links" USING btree ("type","page_slug","locale") WHERE "studio"."short_links"."type" = 'landing_page';--> statement-breakpoint
CREATE INDEX "short_links_guide_idx" ON "studio"."short_links" USING btree ("guide_nano_id");--> statement-breakpoint
CREATE INDEX "org_invite_email_idx" ON "studio"."organization_invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "org_invite_org_id_idx" ON "studio"."organization_invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_unique" ON "studio"."organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "org_member_user_id_idx" ON "studio"."organization_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_member_org_user_idx" ON "studio"."organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_unique_name_per_org" ON "studio"."theme" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "theme_org_idx" ON "studio"."theme" USING btree ("organization_id");