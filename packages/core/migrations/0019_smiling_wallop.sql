ALTER TABLE "studio"."task" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "studio"."task_to_todo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "private"."todo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "private"."todo_translation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "studio"."task" CASCADE;--> statement-breakpoint
DROP TABLE "studio"."task_to_todo" CASCADE;--> statement-breakpoint
DROP TABLE "private"."todo" CASCADE;--> statement-breakpoint
DROP TABLE "private"."todo_translation" CASCADE;--> statement-breakpoint
CREATE INDEX "asset_org_id_idx" ON "studio"."asset" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "guide_translation_guide_id_idx" ON "studio"."guide_translation" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "stop_translation_stop_id_idx" ON "studio"."stop_translation" USING btree ("stop_id");