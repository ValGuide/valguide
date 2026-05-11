import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = process.cwd()
const scannerPath = join(repoRoot, 'scripts/check-secrets.mjs')
const tmp = mkdtempSync(join(tmpdir(), 'valguide-secret-scan-'))

function runSecretScan(filePath) {
  return spawnSync(process.execPath, [scannerPath, '--files', filePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

function runStagedSecretScan(cwd) {
  return spawnSync(process.execPath, [scannerPath, '--staged'], {
    cwd,
    encoding: 'utf8',
  })
}

try {
  const cleanFile = join(tmp, 'clean.env')
  writeFileSync(cleanFile, 'DATABASE_URL=postgres://valguide:valguide@localhost:5432/valguide\n')
  assert.equal(runSecretScan(cleanFile).status, 0)

  const tokenFile = join(tmp, 'token.env')
  const fakeAccessKey = 'AKIAIOSFODNN7EXAMPLE' // secret-scan: allow
  writeFileSync(tokenFile, `AWS_ACCESS_KEY_ID=${fakeAccessKey}\n`)
  const tokenResult = runSecretScan(tokenFile)
  assert.equal(tokenResult.status, 1)
  assert.match(tokenResult.stderr, /AWS access key id/)
  assert.doesNotMatch(tokenResult.stderr, new RegExp(fakeAccessKey))

  const assignedSecretFile = join(tmp, 'assigned.env')
  const assignedSecretValue = ['aBcD1234', 'secret', 'Value', 'With', 'Length'].join('_')
  writeFileSync(assignedSecretFile, `BETTER_AUTH_SECRET=${assignedSecretValue}\n`)
  const assignedSecretResult = runSecretScan(assignedSecretFile)
  assert.equal(assignedSecretResult.status, 1)
  assert.match(assignedSecretResult.stderr, /sensitive assignment/)

  const allowedFixtureFile = join(tmp, 'fixture.env')
  writeFileSync(allowedFixtureFile, `AWS_ACCESS_KEY_ID=${fakeAccessKey} # secret-scan: allow\n`)
  assert.equal(runSecretScan(allowedFixtureFile).status, 0)

  const stagedRepo = join(tmp, 'staged-repo')
  mkdirSync(stagedRepo)
  execFileSync('git', ['init'], { cwd: stagedRepo, stdio: 'ignore' })
  const stagedFile = join(stagedRepo, 'staged.env')
  writeFileSync(stagedFile, `AWS_ACCESS_KEY_ID=${fakeAccessKey}\n`)
  execFileSync('git', ['add', 'staged.env'], { cwd: stagedRepo, stdio: 'ignore' })
  writeFileSync(stagedFile, 'AWS_ACCESS_KEY_ID=replace-with-local-token\n')
  const stagedResult = runStagedSecretScan(stagedRepo)
  assert.equal(stagedResult.status, 1)
  assert.match(stagedResult.stderr, /AWS access key id/)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
