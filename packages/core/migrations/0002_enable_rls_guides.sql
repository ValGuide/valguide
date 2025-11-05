-- Enable Row Level Security for guide table
ALTER TABLE "studio"."guide" ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for guide_translation table
ALTER TABLE "studio"."guide_translation" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view guides they created or guides in their organization
CREATE POLICY "Users can view their own guides"
  ON "studio"."guide"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by
    OR auth.uid() = updated_by
  );

-- Policy: Users can insert guides they create
CREATE POLICY "Users can insert their own guides"
  ON "studio"."guide"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND auth.uid() = updated_by
  );

-- Policy: Users can update guides they created
CREATE POLICY "Users can update their own guides"
  ON "studio"."guide"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by
    OR auth.uid() = updated_by
  )
  WITH CHECK (
    auth.uid() = updated_by
  );

-- Policy: Users can delete guides they created
CREATE POLICY "Users can delete their own guides"
  ON "studio"."guide"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by
  );

-- Policy: Users can view translations for guides they have access to
CREATE POLICY "Users can view translations for their guides"
  ON "studio"."guide_translation"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "studio"."guide"
      WHERE "studio"."guide".id = guide_id
      AND (
        auth.uid() = "studio"."guide".created_by
        OR auth.uid() = "studio"."guide".updated_by
      )
    )
  );

-- Policy: Users can insert translations for guides they created
CREATE POLICY "Users can insert translations for their guides"
  ON "studio"."guide_translation"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "studio"."guide"
      WHERE "studio"."guide".id = guide_id
      AND (
        auth.uid() = "studio"."guide".created_by
        OR auth.uid() = "studio"."guide".updated_by
      )
    )
  );

-- Policy: Users can update translations for guides they have access to
CREATE POLICY "Users can update translations for their guides"
  ON "studio"."guide_translation"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "studio"."guide"
      WHERE "studio"."guide".id = guide_id
      AND (
        auth.uid() = "studio"."guide".created_by
        OR auth.uid() = "studio"."guide".updated_by
      )
    )
  );

-- Policy: Users can delete translations for guides they created
CREATE POLICY "Users can delete translations for their guides"
  ON "studio"."guide_translation"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "studio"."guide"
      WHERE "studio"."guide".id = guide_id
      AND auth.uid() = "studio"."guide".created_by
    )
  );

