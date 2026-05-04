#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tmp = mkdtempSync(join(tmpdir(), 'cloudflare-secrets-test-'))
const envFile = join(tmp, '.env.selfhost')

try {
  writeFileSync(
    envFile,
    ['DOCS_WORKER_NAME=docs-worker', 'DOCS_ROUTES=docs.example.com', 'DOCS_PASSWORD=secret-docs-password'].join('\n'),
    'utf8',
  )

  const output = execFileSync(
    'node',
    [
      '--',
      'scripts/cloudflare-secrets/push.mjs',
      'push',
      'docs',
      '--target-env',
      'prod',
      '--env-file',
      envFile,
      '--dry-run',
    ],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
  ).toString()
  assert.match(output, /would push DOCS_PASSWORD/)

  writeFileSync(
    envFile,
    [
      'STUDIO_WORKER_NAME=studio-worker',
      'STUDIO_ROUTES=studio.example.com',
      'CF_AUTH_KV_ID=auth-kv',
      'CF_TOUR_DATA_KV_ID=tour-kv',
      'CF_MAINTENANCE_KV_ID=maintenance-kv',
      'CF_R2_BUCKET_NAME=valguide-assets',
      'DATABASE_URL=postgres://user:pass@example.com/db',
      'BETTER_AUTH_SECRET=secret-auth',
      'RESEND_SENDING_API_KEY=secret-resend',
      'BETTER_AUTH_URL=https://studio.example.com',
      'BETTER_AUTH_TRUSTED_ORIGINS=https://studio.example.com',
      'BETTER_AUTH_COOKIE_DOMAIN=.example.com',
      'BETTER_AUTH_COOKIE_PREFIX=vg',
      'LINKS_BASE_URL=https://go.example.com',
      'APP_BASE_URL=https://app.example.com',
      'ADMIN_BASE_URL=https://admin.example.com',
      'VITE_PRIVACY_POLICY_URL=https://example.com/privacy',
      'VITE_TERMS_OF_SERVICE_URL=https://example.com/terms',
      'VITE_STUDIO_URL=https://studio.example.com',
      'LINEAR_API_KEY=secret-linear',
    ].join('\n'),
    'utf8',
  )
  const studioOutput = execFileSync(
    'node',
    [
      '--',
      'scripts/cloudflare-secrets/push.mjs',
      'push',
      'studio',
      '--target-env',
      'prod',
      '--env-file',
      envFile,
      '--dry-run',
    ],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
  ).toString()
  assert.match(studioOutput, /would push DATABASE_URL/)
  assert.match(studioOutput, /would push LINEAR_API_KEY/)
  assert.match(studioOutput, /skipping optional secrets not present: VALBOT_SLACK_TOKEN/)

  writeFileSync(envFile, ['DOCS_WORKER_NAME=docs-worker', 'DOCS_ROUTES=docs.example.com'].join('\n'), 'utf8')
  try {
    execFileSync(
      'node',
      [
        '--',
        'scripts/cloudflare-secrets/push.mjs',
        'push',
        'docs',
        '--target-env',
        'prod',
        '--env-file',
        envFile,
        '--dry-run',
      ],
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
    )
    assert.fail('Expected missing docs secret validation to fail')
  } catch (error) {
    assert.match(String(error.stderr), /Missing required docs secret values/)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
  rmSync('apps/docs/wrangler.generated.jsonc', { force: true })
  rmSync('apps/studio/wrangler.generated.jsonc', { force: true })
}
