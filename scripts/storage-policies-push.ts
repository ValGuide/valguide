#!/usr/bin/env tsx

/**
 * Push storage bucket configs to Supabase
 *
 * Executes supabase/init-buckets.sql against the target database.
 * Idempotent — uses ON CONFLICT for bucket upserts.
 *
 * RLS policies are managed via Drizzle migrations (packages/core/features/storage/schema.ts).
 * Use db:generate + db:migrate for policy changes.
 *
 * Run via package.json scripts:
 *   pnpm storage:push:dev   - Push to dev environment
 *   pnpm storage:push:prod  - Push to prod environment
 *
 * Options:
 *   --dry-run      Print the SQL without executing
 *   --file <path>  Use a custom SQL file (default: supabase/init-buckets.sql)
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Use pnpm storage:push:dev or pnpm storage:push:prod.')
  process.exit(1)
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fileArgIdx = args.indexOf('--file')
const sqlFilePath =
  fileArgIdx !== -1 && args[fileArgIdx + 1]
    ? resolve(args[fileArgIdx + 1])
    : resolve(__dirname, '..', 'supabase', 'init-buckets.sql')

async function main() {
  const sqlContent = readFileSync(sqlFilePath, 'utf-8')

  const env = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? 'local' : 'remote'
  console.log(`📦 Storage buckets push`)
  console.log(`   Source: ${sqlFilePath}`)
  console.log(`   Target: ${env}`)
  console.log('')

  if (dryRun) {
    console.log('--- DRY RUN (no changes applied) ---\n')
    console.log(sqlContent)
    return
  }

  const sql = postgres(databaseUrl, { ssl: 'prefer' })

  try {
    await sql.unsafe(sqlContent)
    console.log('✓ Storage buckets pushed successfully')

    // Show summary
    const bucketCount = await sql`SELECT count(*) FROM storage.buckets`
    const policyCount = await sql`
			SELECT count(*) FROM pg_policies
			WHERE schemaname = 'storage' AND tablename = 'objects'
		`
    console.log(`  ${bucketCount[0].count} bucket(s), ${policyCount[0].count} RLS policy/policies active`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Failed to push storage buckets:', err.message)
  process.exit(1)
})
