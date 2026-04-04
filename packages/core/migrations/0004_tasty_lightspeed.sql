CREATE TABLE "studio"."user_status_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_status" "studio"."user_status" NOT NULL,
	"new_status" "studio"."user_status" NOT NULL,
	"changed_by_user_id" uuid,
	"source" varchar(32) NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_status_event_user_idx" ON "studio"."user_status_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_status_event_created_at_idx" ON "studio"."user_status_event" USING btree ("created_at");--> statement-breakpoint
