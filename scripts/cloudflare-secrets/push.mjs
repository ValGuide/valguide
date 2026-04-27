#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { resolveTargetName, targets } from '../wrangler-config/targets.mjs'

const targetOrder = Object.keys(targets)
const validTargetEnvs = new Set(['dev', 'prod'])

function usage() {
  console.error(`Usage:
  pnpm cloudflare-secrets push <target|all> --target-env <dev|prod> [--env-file <path>] [--dry-run]

Targets:
  all, ${targetOrder.join(', ')}`)
}

function parseArgs(argv) {
  const [command, rawTarget, ...rest] = argv
  const flags = new Map()
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`)
    if (arg === '--dry-run') {
      flags.set('dry-run', true)
      continue
    }
    const value = rest[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`)
    flags.set(arg.slice(2), value)
    index += 1
  }
  return { command, target: rawTarget, flags }
}

function parseEnvFile(filePath) {
  const env = {}
  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (key) env[key] = value
  }
  return env
}

function buildInputEnv(envFile) {
  const fileEnv = envFile ? parseEnvFile(resolve(envFile)) : {}
  return { ...fileEnv, ...process.env }
}

function selectedTargets(rawTarget) {
  if (rawTarget === 'all') return targetOrder
  const targetName = resolveTargetName(rawTarget)
  if (!targets[targetName]) throw new Error(`Unknown target: ${rawTarget}`)
  return [targetName]
}

function missingSecretsFor(targetName, inputEnv) {
  return targets[targetName].requiredSecrets.filter((secretName) => !inputEnv[secretName])
}

function pushSecret(targetName, secretName, inputEnv) {
  const target = targets[targetName]
  execFileSync('wrangler', ['secret', 'put', secretName, '--config', `${target.root}/wrangler.generated.jsonc`], {
    cwd: process.cwd(),
    input: inputEnv[secretName],
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

function main() {
  try {
    const { command, target, flags } = parseArgs(process.argv.slice(2))
    const targetEnv = flags.get('target-env')
    if (command !== 'push' || !target || !targetEnv) {
      usage()
      process.exit(1)
    }
    if (!validTargetEnvs.has(targetEnv)) throw new Error(`Invalid --target-env: ${targetEnv}`)

    const envFile = flags.get('env-file')
    if (envFile && !existsSync(resolve(envFile))) throw new Error(`Env file does not exist: ${envFile}`)

    const inputEnv = buildInputEnv(envFile)
    const dryRun = Boolean(flags.get('dry-run'))
    const targetNames = selectedTargets(target)

    for (const targetName of targetNames) {
      const missing = missingSecretsFor(targetName, inputEnv)
      if (missing.length > 0) {
        throw new Error(`Missing required ${targetName} secret values: ${missing.join(', ')}`)
      }

      execFileSync(
        'node',
        [
          '--',
          'scripts/wrangler-config/cli.mjs',
          'generate',
          targetName,
          '--target-env',
          targetEnv,
          ...(envFile ? ['--env-file', envFile] : []),
          ...(dryRun ? ['--dry-run'] : []),
        ],
        {
          cwd: process.cwd(),
          stdio: dryRun ? ['ignore', 'pipe', 'inherit'] : 'inherit',
          env: { ...process.env, ...inputEnv },
        },
      )

      for (const secretName of targets[targetName].requiredSecrets) {
        if (dryRun) {
          console.log(`[dry-run] ${targetName}: would push ${secretName}`)
        } else {
          console.log(`${targetName}: pushing ${secretName}`)
          pushSecret(targetName, secretName, inputEnv)
        }
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
