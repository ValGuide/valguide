#!/usr/bin/env tsx
import { sql } from 'drizzle-orm'
import { db } from '../features/db'

async function checkSchema() {
  console.log('Checking guide_translation schema...\n')

  const result = await db.execute(sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'studio'
      AND table_name = 'guide_translation'
    ORDER BY ordinal_position
  `)

  console.log('Columns in guide_translation:')
  const rows = Array.isArray(result) ? result : result.rows || []
  for (const row of rows) {
    console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
  }

  console.log('\nChecking guide_translation_version table...')
  const versionTableCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'studio'
        AND table_name = 'guide_translation_version'
    ) as exists
  `)

  console.log(`guide_translation_version exists: ${versionTableCheck.rows[0].exists}`)

  if (versionTableCheck.rows[0].exists) {
    const versionCols = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'studio'
        AND table_name = 'guide_translation_version'
      ORDER BY ordinal_position
    `)

    console.log('\nColumns in guide_translation_version:')
    for (const row of versionCols.rows) {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    }
  }
}

checkSchema().catch(console.error)
