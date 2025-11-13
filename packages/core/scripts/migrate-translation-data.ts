#!/usr/bin/env tsx
/**
 * Data migration script: Move existing translation data to versioned structure
 * 
 * This script:
 * 1. Finds all guide_translation rows that have title/description (old schema)
 * 2. Creates version 1 in guide_translation_version for each
 * 3. Updates guide_translation to point to the new version
 * 4. Does the same for stop_translation
 */

import { db } from '../features/db'
import { guideTranslation, guideTranslationVersion, stopTranslation, stopTranslationVersion } from '../features/guides/schema'
import { eq, sql, isNotNull } from 'drizzle-orm'

async function migrateGuideTranslations() {
  console.log('🔄 Migrating guide translations...')
  
  // Find all guide_translation rows that still have title/description columns
  // (This will fail if columns don't exist, which is fine - means already migrated)
  let translationsToMigrate: any[]
  
  try {
    translationsToMigrate = await db.execute(sql`
      SELECT id, guide_id, locale, title, description, created_at
      FROM studio.guide_translation
      WHERE title IS NOT NULL
    `)
  } catch (error: any) {
    if (error.code === '42703') { // column does not exist
      console.log('✅ Guide translation columns already migrated')
      return
    }
    throw error
  }

  console.log(`Found ${translationsToMigrate.rows?.length || 0} guide translations to migrate`)

  for (const row of translationsToMigrate.rows || []) {
    try {
      // Create version 1 with published status
      const [version] = await db
        .insert(guideTranslationVersion)
        .values({
          translationId: row.id,
          version: 1,
          status: 'published',
          title: row.title,
          description: row.description,
          createdAt: row.created_at,
          publishedAt: row.created_at,
        })
        .returning()

      // Update translation to point to this version
      await db.execute(sql`
        UPDATE studio.guide_translation
        SET current_version_id = ${version.id}
        WHERE id = ${row.id}
      `)

      console.log(`✅ Migrated guide translation ${row.id} (locale: ${row.locale})`)
    } catch (error) {
      console.error(`❌ Failed to migrate guide translation ${row.id}:`, error)
    }
  }

  // Drop old columns
  try {
    await db.execute(sql`
      ALTER TABLE studio.guide_translation 
      DROP COLUMN IF EXISTS title,
      DROP COLUMN IF EXISTS description
    `)
    console.log('✅ Dropped old guide_translation columns')
  } catch (error) {
    console.error('⚠️  Could not drop old columns (may not exist):', error)
  }
}

async function migrateStopTranslations() {
  console.log('\n🔄 Migrating stop translations...')
  
  let translationsToMigrate: any[]
  
  try {
    translationsToMigrate = await db.execute(sql`
      SELECT id, stop_id, locale, title, description, transcription, created_at
      FROM studio.stop_translation
      WHERE title IS NOT NULL
    `)
  } catch (error: any) {
    if (error.code === '42703') { // column does not exist
      console.log('✅ Stop translation columns already migrated')
      return
    }
    throw error
  }

  console.log(`Found ${translationsToMigrate.rows?.length || 0} stop translations to migrate`)

  for (const row of translationsToMigrate.rows || []) {
    try {
      // Create version 1 with published status
      const [version] = await db
        .insert(stopTranslationVersion)
        .values({
          translationId: row.id,
          version: 1,
          status: 'published',
          title: row.title,
          description: row.description,
          transcription: row.transcription,
          createdAt: row.created_at,
          publishedAt: row.created_at,
        })
        .returning()

      // Update translation to point to this version
      await db.execute(sql`
        UPDATE studio.stop_translation
        SET current_version_id = ${version.id}
        WHERE id = ${row.id}
      `)

      console.log(`✅ Migrated stop translation ${row.id} (locale: ${row.locale})`)
    } catch (error) {
      console.error(`❌ Failed to migrate stop translation ${row.id}:`, error)
    }
  }

  // Drop old columns
  try {
    await db.execute(sql`
      ALTER TABLE studio.stop_translation 
      DROP COLUMN IF EXISTS title,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS transcription
    `)
    console.log('✅ Dropped old stop_translation columns')
  } catch (error) {
    console.error('⚠️  Could not drop old columns (may not exist):', error)
  }
}

async function main() {
  console.log('🚀 Starting translation data migration...\n')
  
  try {
    await migrateGuideTranslations()
    await migrateStopTranslations()
    
    console.log('\n✨ Migration complete!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
