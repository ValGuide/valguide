CREATE TABLE "studio"."stop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "unique_stop_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"transcription" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"asset_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"role" varchar(50) NOT NULL,
	"locale" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."stop_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stop_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"role" varchar(50) NOT NULL,
	"locale" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."guide" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop" ADD CONSTRAINT "stop_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_translation" ADD CONSTRAINT "stop_translation_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."asset" ADD CONSTRAINT "asset_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset" ADD CONSTRAINT "guide_asset_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_asset" ADD CONSTRAINT "guide_asset_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset" ADD CONSTRAINT "stop_asset_stop_id_stop_id_fk" FOREIGN KEY ("stop_id") REFERENCES "studio"."stop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."stop_asset" ADD CONSTRAINT "stop_asset_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "studio"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_stop_translation" ON "studio"."stop_translation" USING btree ("stop_id","locale");--> statement-breakpoint
CREATE INDEX "asset_type_org_idx" ON "studio"."asset" USING btree ("type","organization_id");--> statement-breakpoint
DROP POLICY IF EXISTS "Users can view their own guides" ON "studio"."guide" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can insert their own guides" ON "studio"."guide" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update their own guides" ON "studio"."guide" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can delete their own guides" ON "studio"."guide" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can view translations for their guides" ON "studio"."guide_translation" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can insert translations for their guides" ON "studio"."guide_translation" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update translations for their guides" ON "studio"."guide_translation" CASCADE;--> statement-breakpoint
DROP POLICY IF EXISTS "Users can delete translations for their guides" ON "studio"."guide_translation" CASCADE;