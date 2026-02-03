#!/usr/bin/env tsx

/**
 * Seed the studio with test data
 *
 * Prerequisites:
 *   1. Download test media first: pnpm dlx tsx scripts/download-test-media.ts
 *
 * Run via package.json scripts:
 *   pnpm seed:dev   - Seed dev environment
 *   pnpm seed:prod  - Seed prod environment (use with caution!)
 *
 * Options:
 *   --user-id <uuid>  Specify the user ID to use (required for first run)
 *   --dry-run         Show what would be created without writing to DB
 */

import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../packages/core/features/schema'
import { valguideId } from '../packages/core/utils/nanoid'
import { SEED_CONFIG, TEST_MEDIA_DIR } from './seed-studio/config'
import { getOrCreateSeedOrg, seedTours } from './seed-studio/seed-database'
import { uploadAllTestMedia } from './seed-studio/upload-assets'

async function main() {
  console.log('🌱 ValGuide Studio Seeder\n')

  const databaseUrl = process.env.DATABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set')
    process.exit(1)
  }
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL is not set')
    process.exit(1)
  }
  if (!supabaseSecretKey) {
    console.error('❌ SUPABASE_SECRET_KEY is not set')
    process.exit(1)
  }

  const userIdArg = process.argv.indexOf('--user-id')
  let userId = userIdArg !== -1 ? process.argv[userIdArg + 1] : undefined

  const isDryRun = process.argv.includes('--dry-run')

  if (isDryRun) {
    console.log('🔍 DRY RUN - No changes will be made\n')
  }

  if (!existsSync(TEST_MEDIA_DIR)) {
    console.error(`❌ Test media not found at ${TEST_MEDIA_DIR}`)
    console.error('   Run first: pnpm dlx tsx scripts/download-test-media.ts')
    process.exit(1)
  }

  console.log('📁 Checking test media files...')
  const imagesExist = existsSync(`${TEST_MEDIA_DIR}/images`)
  const audioExist = existsSync(`${TEST_MEDIA_DIR}/audio`)
  const videoExist = existsSync(`${TEST_MEDIA_DIR}/video`)
  console.log(`  ${imagesExist ? '✓' : '✗'} images/`)
  console.log(`  ${audioExist ? '✓' : '✗'} audio/`)
  console.log(`  ${videoExist ? '✓' : '✗'} video/`)

  if (!imagesExist) {
    console.error('\n❌ No images found. Run: pnpm dlx tsx scripts/download-test-media.ts')
    process.exit(1)
  }

  const client = postgres(databaseUrl, { prepare: false })
  const db = drizzle(client, { schema })

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  })

  if (!userId) {
    console.log('\n👤 Looking for seed user...')
    const SEED_USER_EMAIL = 'curator@museum-zurich.example'
    const { data: users } = await supabase.auth.admin.listUsers()
    const seedUser = users?.users?.find((u) => u.email === SEED_USER_EMAIL)
    if (seedUser) {
      userId = seedUser.id
      console.log(`  Found seed user: ${seedUser.email} (${userId})`)
    } else {
      console.error(`❌ Seed user ${SEED_USER_EMAIL} not found. Use --user-id <uuid> to override.`)
      process.exit(1)
    }
  }

  if (isDryRun) {
    console.log('\n📋 Would create:')
    console.log(`  - Organization: "${SEED_CONFIG.orgName}"`)
    console.log(
      `  - Tours: ${SEED_CONFIG.tourCounts.small} small, ${SEED_CONFIG.tourCounts.medium} medium, ${SEED_CONFIG.tourCounts.large} large`,
    )
    console.log(`  - Assets: uploaded with deduplication`)
    console.log('\n✅ Dry run complete')
    await client.end()
    return
  }

  console.log('\n🏢 Setting up organization...')
  const org = await getOrCreateSeedOrg(db, valguideId, userId)
  if (org.isNew) {
    console.log(`  ✅ Created org: "${SEED_CONFIG.orgName}" (${org.nanoId})`)
  } else {
    console.log(`  ⏭️  Using existing org: "${SEED_CONFIG.orgName}" (${org.nanoId})`)
  }

  console.log('\n📤 Uploading assets (with deduplication)...')
  const assets = await uploadAllTestMedia(db, supabase, org.nanoId, org.id, userId, valguideId)
  console.log(`\n  Summary: ${assets.stats.newUploads} new, ${assets.stats.existing} existing`)

  console.log('\n📚 Creating tours and stops...')
  const seedResult = await seedTours({
    db,
    valguideId,
    orgId: org.id,
    orgNanoId: org.nanoId,
    userId,
    assets,
  })

  console.log('\n' + '='.repeat(50))
  console.log('✅ Seeding complete!')
  console.log('='.repeat(50))
  console.log(`  Organization: ${SEED_CONFIG.orgName}`)
  console.log(`  Tours: ${seedResult.totalTours}`)
  console.log(`  Stops: ${seedResult.totalStops}`)
  console.log(`  Assets: ${assets.stats.total} (${assets.stats.newUploads} new, ${assets.stats.existing} existing)`)

  await client.end()
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
