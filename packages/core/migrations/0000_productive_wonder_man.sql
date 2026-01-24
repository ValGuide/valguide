CREATE TYPE "studio"."short_link_type" AS ENUM('guide', 'stop', 'campaign', 'external', 'landing_page');--> statement-breakpoint
CREATE TYPE "studio"."org_role" AS ENUM('owner', 'admin', 'curator', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "studio"."theme_preset" AS ENUM('angle', 'angle-dark', 'light', 'dark', 'blue', 'blue-dark', 'green', 'green-dark', 'purple', 'purple-dark', 'sage', 'sage-dark', 'stone', 'stone-dark', 'lavender', 'lavender-dark', 'sand', 'sand-dark', 'gallery', 'gallery-dark', 'curator', 'curator-dark', 'claude', 'claude-dark');--> statement-breakpoint
CREATE TABLE "studio"."asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"locale" varchar(10),
	"width" integer,
	"height" integer,
	"duration" integer,
	"organization_id" uuid,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_asset_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"current_version_id" uuid,
	"draft_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_asset_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_asset_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"role" varchar(50) NOT NULL,
	"locale" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"current_version_id" uuid,
	"draft_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_asset_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"role" varchar(50) NOT NULL,
	"locale" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."guide" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"published" timestamp with time zone,
	"organization_id" uuid NOT NULL,
	"theme_id" uuid,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"available_locales" text[] DEFAULT '{"en","de","rm"}' NOT NULL,
	CONSTRAINT "unique_guide_nano_id" UNIQUE("nano_id")
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
CREATE TABLE "studio"."guide_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"current_version_id" uuid,
	"draft_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_translation_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio"."stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"guide_id" uuid,
	"order" integer DEFAULT 0,
	CONSTRAINT "unique_stop_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"current_version_id" uuid,
	"draft_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_translation_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(500) NOT NULL,
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
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset" ADD CONSTRAINT "guide_asset_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset_version" ADD CONSTRAINT "guide_asset_version_guide_asset_id_guide_asset_id_fk" FOREIGN KEY ("guide_asset_id") REFERENCES "studio"."guide_asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset_version" ADD CONSTRAINT "guide_asset_version_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset_version" ADD CONSTRAINT "guide_asset_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset" ADD CONSTRAINT "stop_asset_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset_version" ADD CONSTRAINT "stop_asset_version_stop_asset_id_stop_asset_id_fk" FOREIGN KEY ("stop_asset_id") REFERENCES "studio"."stop_asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset_version" ADD CONSTRAINT "stop_asset_version_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset_version" ADD CONSTRAINT "stop_asset_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_stop" ADD CONSTRAINT "guide_stop_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" ADD CONSTRAINT "guide_translation_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation_version" ADD CONSTRAINT "guide_translation_version_translation_id_guide_translation_id_fk" FOREIGN KEY ("translation_id") REFERENCES "studio"."guide_translation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation_version" ADD CONSTRAINT "guide_translation_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" ADD CONSTRAINT "stop_translation_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation_version" ADD CONSTRAINT "stop_translation_version_translation_id_stop_translation_id_fk" FOREIGN KEY ("translation_id") REFERENCES "studio"."stop_translation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation_version" ADD CONSTRAINT "stop_translation_version_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."organization_member" ADD CONSTRAINT "organization_member_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "studio"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."theme" ADD CONSTRAINT "theme_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_type_org_idx" ON "studio"."asset" USING btree ("type","organization_id");--> statement-breakpoint
CREATE INDEX "asset_org_id_idx" ON "studio"."asset" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_guide_asset" ON "studio"."guide_asset" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_asset_guide_idx" ON "studio"."guide_asset" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_asset_version_version_idx" ON "studio"."guide_asset_version" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "guide_asset_version_guide_asset_idx" ON "studio"."guide_asset_version" USING btree ("guide_asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_stop_asset" ON "studio"."stop_asset" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_asset_stop_idx" ON "studio"."stop_asset" USING btree ("stop_id");--> statement-breakpoint
CREATE INDEX "stop_asset_version_version_idx" ON "studio"."stop_asset_version" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "stop_asset_version_stop_asset_idx" ON "studio"."stop_asset_version" USING btree ("stop_asset_id");--> statement-breakpoint
CREATE INDEX "guide_organization_id_idx" ON "studio"."guide" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_guide_stop" ON "studio"."guide_stop" USING btree ("guide_id","stop_id");--> statement-breakpoint
CREATE INDEX "guide_stop_guide_idx" ON "studio"."guide_stop" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_stop_stop_idx" ON "studio"."guide_stop" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_guide_translation" ON "studio"."guide_translation" USING btree ("guide_id","locale");--> statement-breakpoint
CREATE INDEX "guide_translation_guide_id_idx" ON "studio"."guide_translation" USING btree ("guide_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_guide_translation_version" ON "studio"."guide_translation_version" USING btree ("translation_id","version");--> statement-breakpoint
CREATE INDEX "guide_translation_version_version_idx" ON "studio"."guide_translation_version" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "stop_organization_id_idx" ON "studio"."stop" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_stop_translation" ON "studio"."stop_translation" USING btree ("stop_id","locale");--> statement-breakpoint
CREATE INDEX "stop_translation_stop_id_idx" ON "studio"."stop_translation" USING btree ("stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_stop_translation_version" ON "studio"."stop_translation_version" USING btree ("translation_id","version");--> statement-breakpoint
CREATE INDEX "stop_translation_version_version_idx" ON "studio"."stop_translation_version" USING btree ("version_id");--> statement-breakpoint
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