#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTargetName, targets } from './targets.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const validTargetEnvs = new Set(['dev', 'prod'])

function usage() {
  console.error(`Usage:
  pnpm wrangler-config generate <target> --target-env <dev|prod> [--env-file <path>] [--dry-run]
  pnpm wrangler-config list

Targets:
  ${Object.keys(targets).join(', ')}`)
}

function parseArgs(argv) {
  const [command, rawTarget, ...rest] = argv
  const flags = new Map()
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }
    if (arg === '--dry-run') {
      flags.set('dry-run', true)
      continue
    }
    const value = rest[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`)
    }
    flags.set(arg.slice(2), value)
    index += 1
  }
  return { command, target: rawTarget ? resolveTargetName(rawTarget) : undefined, flags }
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
  const fileEnv = envFile ? parseEnvFile(resolve(repoRoot, envFile)) : {}
  return { ...fileEnv, ...process.env }
}

function requireValue(inputEnv, name, missing) {
  const value = inputEnv[name]
  if (!value) missing.push(name)
  return value
}

function parseRoutes(value) {
  return value
    .split(',')
    .map((route) => route.trim())
    .filter(Boolean)
    .map((route) => {
      const [pattern, ...parts] = route.split('|').map((part) => part.trim())
      const parsed = { pattern }
      for (const part of parts) {
        const [key, rawValue] = part.split('=').map((token) => token.trim())
        if (key === 'zone' && rawValue) parsed.zone_name = rawValue
      }
      if (!parsed.zone_name) parsed.custom_domain = true
      return parsed
    })
}

function buildVars(target, targetEnv, inputEnv, missing) {
  const vars = {}
  for (const definition of target.vars ?? []) {
    const value = definition.fromTargetEnv ? targetEnv : (inputEnv[definition.name] ?? definition.defaultValue)
    if (
      (definition.required ||
        (!definition.optional && definition.defaultValue === undefined && !definition.fromTargetEnv)) &&
      !value
    ) {
      missing.push(definition.name)
      continue
    }
    if (value !== undefined && value !== '') vars[definition.name] = value
  }

  if (
    targetEnv !== 'prod' &&
    !vars.BLOCK_ROBOTS &&
    target.vars?.some((definition) => definition.name === 'BLOCK_ROBOTS')
  ) {
    vars.BLOCK_ROBOTS = 'true'
  }

  return vars
}

function buildConfig(targetName, targetEnv, inputEnv) {
  const target = targets[targetName]
  if (!target) throw new Error(`Unknown target: ${targetName}`)
  if (!validTargetEnvs.has(targetEnv)) throw new Error(`Invalid --target-env: ${targetEnv}`)

  const missing = []
  const name = requireValue(inputEnv, target.nameEnvVar, missing)
  const routeValue = requireValue(inputEnv, target.routesEnvVar, missing)

  const config = {
    $schema: 'node_modules/wrangler/config-schema.json',
    name,
    compatibility_date: '2025-09-24',
    main: target.main,
    workers_dev: false,
  }

  if (target.compatibilityFlags) config.compatibility_flags = target.compatibilityFlags
  if (target.placement) config.placement = target.placement
  if (target.observability) config.observability = target.observability
  if (target.assets) config.assets = target.assets
  if (target.ai) config.ai = target.ai
  if (routeValue) config.routes = parseRoutes(routeValue)

  const kvNamespaces = []
  for (const binding of target.kvNamespaces ?? []) {
    kvNamespaces.push({ binding: binding.binding, id: requireValue(inputEnv, binding.envVar, missing) })
  }
  if (kvNamespaces.length > 0) config.kv_namespaces = kvNamespaces

  const r2Buckets = []
  for (const bucket of target.r2Buckets ?? []) {
    const generatedBucket = {
      binding: bucket.binding,
      bucket_name: requireValue(inputEnv, bucket.envVar, missing),
    }
    const jurisdiction = inputEnv[bucket.jurisdictionEnvVar] ?? bucket.defaultJurisdiction
    if (jurisdiction) generatedBucket.jurisdiction = jurisdiction
    r2Buckets.push(generatedBucket)
  }
  if (r2Buckets.length > 0) config.r2_buckets = r2Buckets

  const vars = buildVars(target, targetEnv, inputEnv, missing)
  if (Object.keys(vars).length > 0) config.vars = vars

  const uniqueMissing = [...new Set(missing)].filter(Boolean)
  if (uniqueMissing.length > 0) {
    throw new Error(`Missing required ${targetName} ${targetEnv} config: ${uniqueMissing.join(', ')}`)
  }

  return { config, outputPath: join(repoRoot, target.root, 'wrangler.generated.jsonc') }
}

function generate(targetName, targetEnv, inputEnv, dryRun) {
  const { config, outputPath } = buildConfig(targetName, targetEnv, inputEnv)
  if (dryRun) {
    console.log(`Validated ${targetName} ${targetEnv} Wrangler config inputs`)
    console.log(`Would write ${outputPath.replace(`${repoRoot}/`, '')}`)
    return
  }
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${outputPath.replace(`${repoRoot}/`, '')}`)
}

function main() {
  try {
    const { command, target, flags } = parseArgs(process.argv.slice(2))
    if (command === 'list') {
      for (const [name, config] of Object.entries(targets)) {
        console.log(`${name}\t${config.root}\t${config.requiredSecrets.join(',')}`)
      }
      return
    }
    if (command !== 'generate' || !target) {
      usage()
      process.exit(1)
    }

    const envFile = flags.get('env-file')
    if (envFile && !existsSync(resolve(repoRoot, envFile))) {
      throw new Error(`Env file does not exist: ${envFile}`)
    }

    generate(target, flags.get('target-env'), buildInputEnv(envFile), Boolean(flags.get('dry-run')))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
