CREATE SCHEMA IF NOT EXISTS "private";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "studio";
--> statement-breakpoint
CREATE TABLE "private"."todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_todo_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "private"."todo_translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"todo_id" serial NOT NULL,
	"language_code" text NOT NULL,
	"title" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "studio"."task" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_task_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "studio"."task_to_todo" (
	"task_id" integer NOT NULL,
	"todo_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio"."short_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_link_short_code" UNIQUE("code")
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
ALTER TABLE "private"."todo_translation" ADD CONSTRAINT "todo_translation_todo_id_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "private"."todo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."task_to_todo" ADD CONSTRAINT "task_to_todo_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "studio"."task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."task_to_todo" ADD CONSTRAINT "task_to_todo_todo_id_todo_id_fk" FOREIGN KEY ("todo_id") REFERENCES "private"."todo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio"."profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_translation" ON "private"."todo_translation" USING btree ("todo_id","language_code");