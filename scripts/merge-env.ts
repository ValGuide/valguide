#!/usr/bin/env tsx
import chalk from 'chalk'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { borderBox } from './border-box'

export type Environment = 'local' | 'dev' | 'prod'

const ROOT_DIR = join(__dirname, '..')
const SECRETS_DIR = join(ROOT_DIR, '.secrets')
const OUTPUT_DIR = join(ROOT_DIR, '.env-merged')

const ENV_FILES: Record<Environment, string[]> = {
  local: ['.env.defaults', '.env.auth.local', '.env.neon.local', '.env.resend.dev'],
  dev: ['.env.defaults', '.env.cloudflare.dev', '.env.auth.dev', '.env.neon.dev', '.env.resend.dev'],
  prod: ['.env.defaults', '.env.cloudflare.prod', '.env.auth.prod', '.env.neon.prod', '.env.resend.prod'],
}

/**
 * Parse a .env file and return key-value pairs
 */
export function parseEnvFile(content: string): Map<string, string> {
  const vars = new Map<string, string>()
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, equalIndex).trim()
    const value = trimmed.slice(equalIndex + 1).trim()

    if (key) {
      vars.set(key, value)
    }
  }

  return vars
}

/**
 * Merge multiple env files, with later files overriding earlier ones
 */
export function mergeEnvFiles(env: Environment, silent = false): Map<string, string> {
  const merged = new Map<string, string>()
  const files = ENV_FILES[env]

  for (const file of files) {
    const filePath = join(SECRETS_DIR, file)

    try {
      const content = readFileSync(filePath, 'utf-8')
      const vars = parseEnvFile(content)

      // Merge vars (later files override earlier ones)
      for (const [key, value] of vars) {
        merged.set(key, value)
      }

      if (!silent) {
        console.log(chalk.green(`✓ Loaded ${file} (${vars.size} variables)`))
      }
    } catch {
      if (!silent) {
        console.warn(chalk.yellow(`⚠ Skipped ${file} (file not found)`))
      }
    }
  }

  return merged
}

/**
 * Convert Map to .env file format
 */
export function formatEnvFile(vars: Map<string, string>): string {
  const lines: string[] = [`# Merged environment variables - Generated at ${new Date().toISOString()}`, '']

  for (const [key, value] of vars) {
    lines.push(`${key}=${value}`)
  }

  return lines.join('\n')
}

/**
 * Get the output path for a merged env file
 */
export function getMergedEnvPath(env: Environment): string {
  return join(OUTPUT_DIR, `.env.${env}`)
}

/**
 * Check if merged env file exists and is recent (within maxAge ms)
 */
export function isMergedEnvRecent(env: Environment, maxAgeMs = 60000): boolean {
  const outputPath = getMergedEnvPath(env)
  if (!existsSync(outputPath)) {
    return false
  }

  try {
    const stats = require('node:fs').statSync(outputPath)
    const age = Date.now() - stats.mtimeMs
    return age < maxAgeMs
  } catch {
    return false
  }
}

/**
 * Merge env files and write to output directory
 * Returns the merged variables
 */
export function mergeAndWrite(env: Environment, silent = false): Map<string, string> {
  // Merge env files
  const merged = mergeEnvFiles(env, silent)

  // Create output directory if it doesn't exist
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // Write merged file
  const outputPath = getMergedEnvPath(env)
  const content = formatEnvFile(merged)
  writeFileSync(outputPath, content, 'utf-8')

  if (!silent) {
    console.log(chalk.green(`\n✓ Merged ${merged.size} variables to ${outputPath.replace(`${ROOT_DIR}/`, '')}\n`))
  }

  return merged
}

/**
 * Read merged env file if it exists
 */
export function readMergedEnv(env: Environment): Map<string, string> | null {
  const outputPath = getMergedEnvPath(env)
  try {
    const content = readFileSync(outputPath, 'utf-8')
    return parseEnvFile(content)
  } catch {
    return null
  }
}

/**
 * Main function - only runs when script is executed directly
 */
function main() {
  const args = process.argv.slice(2)
  const envArg = args[0]

  // Validate environment argument
  const validEnvs: Environment[] = ['local', 'dev', 'prod']
  if (!envArg || !validEnvs.includes(envArg as Environment)) {
    console.error(chalk.red(`\nUsage: pnpm env:merge <environment>\n\nValid environments: ${validEnvs.join(', ')}\n`))
    process.exit(1)
  }

  const env = envArg as Environment

  console.log(`\n${borderBox(`Merging environment variables for: ${env.toUpperCase()}`)}\n`)

  mergeAndWrite(env)
}

// Only run main() if this file is executed directly (not imported)
if (require.main === module) {
  main()
}
