import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = process.cwd()
const tmp = mkdtempSync(join(tmpdir(), 'valguide-secret-scan-'))

function runSecretScan(filePath) {
  return spawnSync(process.execPath, ['scripts/check-secrets.mjs', '--files', filePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

try {
  const cleanFile = join(tmp, 'clean.env')
  writeFileSync(cleanFile, 'DATABASE_URL=postgres://valguide:valguide@localhost:5432/valguide\n')
  assert.equal(runSecretScan(cleanFile).status, 0)

  const tokenFile = join(tmp, 'token.env')
  const fakeGitHubToken = `ghp_${'a'.repeat(36)}`
  writeFileSync(tokenFile, `GITHUB_TOKEN=${fakeGitHubToken}\n`)
  const tokenResult = runSecretScan(tokenFile)
  assert.equal(tokenResult.status, 1)
  assert.match(tokenResult.stderr, /GitHub token/)
  assert.doesNotMatch(tokenResult.stderr, new RegExp(fakeGitHubToken))

  const assignedSecretFile = join(tmp, 'assigned.env')
  const assignedSecretValue = ['aBcD1234', 'secret', 'Value', 'With', 'Length'].join('_')
  writeFileSync(assignedSecretFile, `BETTER_AUTH_SECRET=${assignedSecretValue}\n`)
  const assignedSecretResult = runSecretScan(assignedSecretFile)
  assert.equal(assignedSecretResult.status, 1)
  assert.match(assignedSecretResult.stderr, /sensitive assignment/)

  const allowedFixtureFile = join(tmp, 'fixture.env')
  writeFileSync(allowedFixtureFile, `GITHUB_TOKEN=${fakeGitHubToken} # secret-scan: allow\n`)
  assert.equal(runSecretScan(allowedFixtureFile).status, 0)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
