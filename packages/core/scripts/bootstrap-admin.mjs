#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { hashPassword } from 'better-auth/crypto'
import postgres from 'postgres'

function usage() {
  console.error(`Usage:
  read -s ADMIN_PASSWORD && export ADMIN_PASSWORD
  pnpm --filter @valguide/core admin:bootstrap -- --email admin@example.com [--name "Admin"]
  pnpm --filter @valguide/core admin:bootstrap -- --email admin@example.com --password-stdin

Required env:
  DATABASE_URL
  ADMIN_ALLOWED_EMAILS

Notes:
  The email must already be listed in ADMIN_ALLOWED_EMAILS.
  The password is written as a Better Auth credential hash. It is not printed or stored in env by this script.`)
}

function parseArgs(argv) {
  const flags = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--password-stdin') {
      flags.set('password-stdin', true)
      continue
    }
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`)
    }
    flags.set(arg.slice(2), value)
    index += 1
  }
  return flags
}

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

function allowedEmails(value) {
  return value
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
}

async function readPassword(flags) {
  if (flags.get('password-stdin')) {
    if (process.stdin.isTTY) {
      throw new Error('--password-stdin requires a password to be piped on stdin.')
    }
    return readFileSync(0, 'utf8').replace(/\r?\n$/, '')
  }
  return process.env.ADMIN_PASSWORD ?? ''
}

async function main() {
  let sql
  try {
    const flags = parseArgs(process.argv.slice(2))
    const email = normalizeEmail(flags.get('email') ?? '')
    const name = String(flags.get('name') ?? email.split('@')[0] ?? 'Admin')
    const databaseUrl = process.env.DATABASE_URL
    const allowed = allowedEmails(process.env.ADMIN_ALLOWED_EMAILS ?? '')
    const password = await readPassword(flags)

    if (!email) throw new Error('Missing --email.')
    if (!databaseUrl) throw new Error('DATABASE_URL is required.')
    if (allowed.length === 0) throw new Error('ADMIN_ALLOWED_EMAILS must include at least one email.')
    if (!allowed.includes(email)) {
      throw new Error(`Admin email ${email} is not listed in ADMIN_ALLOWED_EMAILS.`)
    }
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters long.')

    const hashedPassword = await hashPassword(password)
    sql = postgres(databaseUrl, { prepare: false, max: 1 })

    const [user] = await sql`
      insert into auth.user (name, email, email_verified, image)
      values (${name}, ${email}, true, null)
      on conflict (email) do update set
        name = excluded.name,
        email_verified = true,
        updated_at = now()
      returning id, email
    `

    await sql`
      insert into auth.account (user_id, account_id, provider_id, password)
      values (${user.id}, ${user.id}, 'credential', ${hashedPassword})
      on conflict (provider_id, account_id) do update set
        password = excluded.password,
        updated_at = now()
    `

    console.log(`Admin credential is ready for ${user.email}.`)
  } catch (error) {
    usage()
    console.error('')
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  } finally {
    if (sql) {
      await sql.end({ timeout: 0 })
    }
  }
}

await main()
