#!/usr/bin/env tsx
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { borderBox } from './border-box'

type Environment = 'local' | 'dev' | 'prod'

const SECRETS_DIR = join(__dirname, '../.secrets')
const OUTPUT_DIR = join(__dirname, '../.env-merged')

const ENV_FILES: Record<Environment, string[]> = {
  local: ['.env.defaults', '.env.supabase.local', '.env.resend.dev'],
  dev: ['.env.defaults', '.env.supabase.dev', '.env.resend.dev'],
  prod: ['.env.defaults', '.env.supabase.prod', '.env.resend.prod'],
}

/**
 * Parse a .env file and return key-value pairs
 */
function parseEnvFile(content: string): Map<string, string> {
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
function mergeEnvFiles(env: Environment): Map<string, string> {
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

      console.log(chalk.green(`✓ Loaded ${file} (${vars.size} variables)`))
    } catch (error) {
      console.warn(chalk.yellow(`⚠ Skipped ${file} (file not found)`))
    }
  }

  return merged
}

/**
 * Convert Map to .env file format
 */
function formatEnvFile(vars: Map<string, string>): string {
  const lines: string[] = ['# Merged environment variables', '']

  for (const [key, value] of vars) {
    lines.push(`${key}=${value}`)
  }

  return lines.join('\n')
}

/**
 * Main function
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

  // Merge env files
  const merged = mergeEnvFiles(env)

  // Create output directory if it doesn't exist
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // Write merged file
  const outputPath = join(OUTPUT_DIR, `.env.${env}`)
  const content = formatEnvFile(merged)
  writeFileSync(outputPath, content, 'utf-8')

  console.log(chalk.green(`\n✓ Merged ${merged.size} variables to ${outputPath.replace(__dirname + '/../', '')}\n`))
}

main()
