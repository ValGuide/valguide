ALTER TABLE studio.guide ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_guide_archived_at ON studio.guide(archived_at) WHERE archived_at IS NOT NULL;
