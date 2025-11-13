-- Manual schema application for versioned translations
-- Run this with: pnpm env:load psql -f packages/core/scripts/apply-schema-manually.sql

-- 1. Create version tables
CREATE TABLE IF NOT EXISTS studio.guide_translation_version (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id uuid NOT NULL REFERENCES studio.guide_translation(id) ON DELETE CASCADE,
    version integer NOT NULL,
    status studio.translation_status NOT NULL DEFAULT 'draft',
    title varchar(500) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at timestamp with time zone,
    CONSTRAINT unique_guide_translation_version UNIQUE(translation_id, version)
);

CREATE TABLE IF NOT EXISTS studio.stop_translation_version (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id uuid NOT NULL REFERENCES studio.stop_translation(id) ON DELETE CASCADE,
    version integer NOT NULL,
    status studio.translation_status NOT NULL DEFAULT 'draft',
    title varchar(500) NOT NULL,
    description text,
    transcription text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at timestamp with time zone,
    CONSTRAINT unique_stop_translation_version UNIQUE(translation_id, version)
);

-- 2. Add pointer columns to translation tables
ALTER TABLE studio.guide_translation 
ADD COLUMN IF NOT EXISTS current_version_id uuid,
ADD COLUMN IF NOT EXISTS draft_version_id uuid;

ALTER TABLE studio.stop_translation 
ADD COLUMN IF NOT EXISTS current_version_id uuid,
ADD COLUMN IF NOT EXISTS draft_version_id uuid;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS guide_translation_version_status_idx 
ON studio.guide_translation_version(translation_id, status);

CREATE INDEX IF NOT EXISTS stop_translation_version_status_idx 
ON studio.stop_translation_version(translation_id, status);

SELECT 'Schema applied successfully!' as result;
