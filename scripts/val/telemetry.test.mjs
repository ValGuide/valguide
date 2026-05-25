import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = process.cwd()
const tmp = mkdtempSync(join(tmpdir(), 'val-telemetry-test-'))

function runTelemetry(args, extraEnv = {}) {
  return execFileSync(process.execPath, ['--', 'scripts/val.mjs', 'telemetry', ...args], {
    cwd: repoRoot,
    env: {
      PATH: process.env.PATH,
      HOME: tmp,
      ...extraEnv,
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

try {
  const defaultStatus = runTelemetry(['status'])
  assert.match(defaultStatus, /ValGuide CLI telemetry is enabled\./)
  assert.match(defaultStatus, /Project key source: built-in ValGuide CLI telemetry project\./)

  const envStatus = runTelemetry(['status'], {
    VALGUIDE_TELEMETRY_KEY: 'phc_envOverrideForTelemetryStatusTestValue1234567890',
  })
  assert.match(envStatus, /Project key source: VALGUIDE_TELEMETRY_KEY\./)

  runTelemetry(['disable'])
  const disabledStatus = runTelemetry(['status'])
  assert.match(disabledStatus, /ValGuide CLI telemetry is disabled:/)

  runTelemetry(['enable'])
  const enabledStatus = runTelemetry(['status'])
  assert.match(enabledStatus, /ValGuide CLI telemetry is enabled\./)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
