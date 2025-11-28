#!/usr/bin/env tsx
import postgres from 'postgres'

const sql = postgres(process.env.VG_DATABASE_URL!)

async function verify() {
  console.log('🔍 Verifying database schema...\n')

  // Check guide_translation columns
  const gtCols = await sql`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_schema = 'studio' AND table_name = 'guide_translation'
    ORDER BY ordinal_position
  `

  console.log('guide_translation columns:')
  gtCols.forEach((r) => {
    console.log(`  ✓ ${r.column_name}`)
  })

  const hasCurrentVersion = gtCols.some((r) => r.column_name === 'current_version_id')
  const hasDraftVersion = gtCols.some((r) => r.column_name === 'draft_version_id')
  const hasOldTitle = gtCols.some((r) => r.column_name === 'title')

  console.log(`\n  Has current_version_id: ${hasCurrentVersion ? '✅' : '❌'}`)
  console.log(`  Has draft_version_id: ${hasDraftVersion ? '✅' : '❌'}`)
  console.log(`  Has old title column: ${hasOldTitle ? '⚠️  NEEDS MIGRATION' : '✅ Migrated'}`)

  // Check guide_translation_version table
  const versionTableExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'studio' AND table_name = 'guide_translation_version'
    ) as exists
  `

  console.log(`\nguide_translation_version table exists: ${versionTableExists[0]?.exists ? '✅' : '❌'}`)

  if (versionTableExists[0]?.exists) {
    const versionCols = await sql`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'studio' AND table_name = 'guide_translation_version'
      ORDER BY ordinal_position
    `
    console.log('\nguide_translation_version columns:')
    versionCols.forEach((r) => {
      console.log(`  ✓ ${r.column_name}`)
    })
  }

  // Check enum
  const enumExists = await sql`
    SELECT EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'translation_status'
    ) as exists
  `

  console.log(`\ntranslation_status enum exists: ${enumExists[0]?.exists ? '✅' : '❌'}`)

  await sql.end()
}

verify().catch(console.error)
