CREATE TABLE "studio"."guide" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nano_id" varchar(21) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"published" timestamp with time zone,
	"cover_image" text,
	"organization_id" uuid,
	CONSTRAINT "unique_guide_nano_id" UNIQUE("nano_id")
);
--> statement-breakpoint
CREATE TABLE "studio"."guide_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide" ADD CONSTRAINT "guide_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."guide_translation" ADD CONSTRAINT "guide_translation_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "studio"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_guide_translation" ON "studio"."guide_translation" USING btree ("guide_id","locale");