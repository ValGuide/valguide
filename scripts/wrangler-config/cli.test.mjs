#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tmp = mkdtempSync(join(tmpdir(), 'wrangler-config-test-'))
const envFile = join(tmp, '.env.selfhost')

try {
  execFileSync(
    'node',
    ['--', 'scripts/wrangler-config/cli.mjs', 'generate', 'app', '--target-env', 'dev', '--env-file', envFile],
    {
      cwd: process.cwd(),
      input: '',
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
} catch (error) {
  assert.match(String(error.stderr ?? error.message), /Env file does not exist/)
}

try {
  const content = [
    'APP_WORKER_NAME=selfhost-app',
    'APP_ROUTES=app.example.com',
    'CF_AUTH_KV_ID=auth-kv',
    'CF_TOUR_DATA_KV_ID=tour-kv',
    'CF_MAINTENANCE_KV_ID=maintenance-kv',
    'APP_BASE_URL=https://app.example.com',
    'BETTER_AUTH_URL=https://app.example.com',
    'BETTER_AUTH_TRUSTED_ORIGINS=https://app.example.com',
    'BETTER_AUTH_COOKIE_DOMAIN=.example.com',
    'BETTER_AUTH_COOKIE_PREFIX=selfhost-auth',
    'VITE_PRIVACY_POLICY_URL=https://www.example.com/privacy',
    'VITE_TERMS_OF_SERVICE_URL=https://www.example.com/terms',
  ].join('\n')
  await import('node:fs').then(({ writeFileSync }) => writeFileSync(envFile, content, 'utf8'))

  execFileSync(
    'node',
    ['--', 'scripts/wrangler-config/cli.mjs', 'generate', 'app', '--target-env', 'dev', '--env-file', envFile],
    {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  const generated = JSON.parse(readFileSync('apps/app/wrangler.generated.jsonc', 'utf8'))
  assert.equal(generated.name, 'selfhost-app')
  assert.equal(generated.main, 'dist/server/index.js')
  assert.equal(generated.no_bundle, true)
  assert.deepEqual(generated.assets, { directory: 'dist/client' })
  assert.equal(generated.routes[0].pattern, 'app.example.com')
  assert.equal(generated.vars.BLOCK_ROBOTS, undefined)
  assert.equal(generated.kv_namespaces.length, 3)

  const output = execFileSync(
    'node',
    ['--', 'scripts/wrangler-config/cli.mjs', 'generate', 'worker:image-guard', '--target-env', 'prod', '--dry-run'],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        IMAGE_GUARD_WORKER_NAME: 'image-guard',
        IMAGE_GUARD_ROUTES: 'assets.example.com/i/*|zone=example.com,assets.example.com/v/*|zone=example.com',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).toString()
  assert.match(output, /Validated worker:image-guard prod/)
} finally {
  rmSync(tmp, { recursive: true, force: true })
  rmSync('apps/app/wrangler.generated.jsonc', { force: true })
}
