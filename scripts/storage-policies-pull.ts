#!/usr/bin/env tsx

/**
 * Pull current storage bucket configs and RLS policies from Supabase
 *
 * Run via package.json scripts:
 *   pnpm storage:pull:dev   - Pull from dev environment
 *   pnpm storage:pull:prod  - Pull from prod environment
 *
 * Options:
 *   --output <path>  Write SQL to file instead of stdout (default: stdout)
 */

import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Use pnpm storage:pull:dev or pnpm storage:pull:prod.')
  process.exit(1)
}

const outputArg = process.argv.find((a) => a === '--output')
const outputPath = outputArg ? process.argv[process.argv.indexOf(outputArg) + 1] : null

async function main() {
  const sql = postgres(databaseUrl, { ssl: 'prefer' })

  try {
    // 1. Pull bucket configs
    const buckets = await sql`
			SELECT id, name, public, file_size_limit, allowed_mime_types
			FROM storage.buckets
			ORDER BY id
		`

    // 2. Pull RLS policies on storage.objects
    const policies = await sql`
			SELECT
				policyname AS name,
				CASE
					WHEN cmd = 'r' THEN 'SELECT'
					WHEN cmd = 'a' THEN 'INSERT'
					WHEN cmd = 'w' THEN 'UPDATE'
					WHEN cmd = 'd' THEN 'DELETE'
					ELSE cmd::text
				END AS command,
				CASE
					WHEN permissive = 'true' THEN 'PERMISSIVE'
					ELSE 'RESTRICTIVE'
				END AS type,
				ARRAY(
					SELECT rolname FROM pg_roles WHERE oid = ANY(roles)
				) AS roles,
				qual AS using_expression,
				with_check AS with_check_expression
			FROM pg_policies
			WHERE schemaname = 'storage' AND tablename = 'objects'
			ORDER BY policyname
		`

    // 3. Generate SQL
    const lines: string[] = []
    lines.push('-- ============================================================================')
    lines.push('-- Storage Buckets & RLS Policies')
    lines.push(
      `-- Pulled from: ${databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? 'local' : 'remote'}`,
    )
    lines.push(`-- Date: ${new Date().toISOString()}`)
    lines.push('-- ============================================================================')
    lines.push('')

    // Buckets
    lines.push('-- Buckets')
    lines.push('-- -------')
    for (const bucket of buckets) {
      const mimeTypes = bucket.allowed_mime_types
        ? `ARRAY[${(bucket.allowed_mime_types as string[]).map((m) => `'${m}'`).join(', ')}]`
        : 'null'

      lines.push(`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)`)
      lines.push(`VALUES ('${bucket.id}', '${bucket.name}', ${bucket.public}, ${bucket.file_size_limit}, ${mimeTypes})`)
      lines.push(`ON CONFLICT (id) DO UPDATE SET`)
      lines.push(`  public = EXCLUDED.public,`)
      lines.push(`  file_size_limit = EXCLUDED.file_size_limit,`)
      lines.push(`  allowed_mime_types = EXCLUDED.allowed_mime_types;`)
      lines.push('')
    }

    // RLS
    lines.push('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;')
    lines.push('')
    lines.push('-- RLS Policies')
    lines.push('-- ------------')

    for (const policy of policies) {
      const roles = (policy.roles as string[]).join(', ')
      lines.push(`DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;`)
      lines.push(`CREATE POLICY "${policy.name}"`)
      lines.push(`ON storage.objects`)
      lines.push(`FOR ${policy.command}`)
      lines.push(`TO ${roles}`)

      if (policy.using_expression) {
        lines.push(`USING (${policy.using_expression})`)
      }
      if (policy.with_check_expression) {
        lines.push(`WITH CHECK (${policy.with_check_expression})`)
      }

      lines.push(';')
      lines.push('')
    }

    const output = lines.join('\n')

    if (outputPath) {
      const { writeFileSync } = await import('node:fs')
      writeFileSync(outputPath, output, 'utf-8')
      console.log(`Written to ${outputPath}`)
    } else {
      console.log(output)
    }

    // Summary
    console.error(`\n✓ ${buckets.length} bucket(s), ${policies.length} RLS policy/policies pulled`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Failed to pull storage policies:', err.message)
  process.exit(1)
})
