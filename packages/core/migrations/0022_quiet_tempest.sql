CREATE TYPE "studio"."theme_preset" AS ENUM('angle', 'angle-dark', 'light', 'dark', 'blue', 'blue-dark', 'green', 'green-dark', 'purple', 'purple-dark', 'sage', 'sage-dark', 'stone', 'stone-dark', 'lavender', 'lavender-dark', 'sand', 'sand-dark', 'gallery', 'gallery-dark', 'curator', 'curator-dark', 'claude', 'claude-dark');--> statement-breakpoint
ALTER TYPE "public"."translation_status" SET SCHEMA "studio";--> statement-breakpoint
ALTER TYPE "public"."short_link_type" SET SCHEMA "studio";--> statement-breakpoint
ALTER TYPE "public"."org_role" SET SCHEMA "studio";--> statement-breakpoint
ALTER TABLE "studio"."theme" ALTER COLUMN "base_preset" SET DATA TYPE "studio"."theme_preset" USING "base_preset"::"studio"."theme_preset";