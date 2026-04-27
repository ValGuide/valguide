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
}
