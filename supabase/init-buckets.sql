-- Storage Bucket Definitions
-- Idempotent — safe to run multiple times (uses ON CONFLICT)
--
-- RLS policies are managed via Drizzle migrations:
--   packages/core/features/storage/schema.ts
--
-- Apply buckets with: pnpm storage:push:dev / pnpm storage:push:prod

-- 1. Assets bucket (private, 500MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', false, 524288000, null)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Studio feedback bucket (public, 5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('studio-feedback', 'studio-feedback', true, 5242880, null)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
