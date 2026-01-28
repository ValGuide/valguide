#!/usr/bin/env npx tsx
/**
 * Remove unused i18n translation keys from all locale files
 * Usage: npx tsx scripts/remove-unused-i18n-keys.ts [--dry-run]
 */

import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const MESSAGES_DIR = 'packages/core/i18n/messages'
const LOCALE_FILES = ['en.json', 'de.json', 'rm.json']
const SEARCH_DIRS = ['apps', 'packages']

const isDryRun = process.argv.includes('--dry-run')

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function getNamespaceKeys(obj: Record<string, unknown>): Map<string, string[]> {
  const namespaces = new Map<string, string[]>()
  for (const [namespace, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      const keys = flattenKeys(value as Record<string, unknown>)
      namespaces.set(namespace, keys)
    }
  }
  return namespaces
}

function extractAllStringsFromCodebase(): Set<string> {
  const result = execSync(
    `rg -o "['\\"]([^'\\"]+)['\\"]" ${SEARCH_DIRS.join(' ')} --include='*.ts' --include='*.tsx' -I --no-filename 2>/dev/null || true`,
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 },
  )

  const strings = new Set<string>()
  for (const line of result.split('\n')) {
    const match = line.match(/^['"](.+)['"]$/)
    if (match) {
      strings.add(match[1])
    }
  }
  return strings
}

function removeKeyFromObject(obj: Record<string, unknown>, keyPath: string): boolean {
  const parts = keyPath.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current[part] && typeof current[part] === 'object') {
      current = current[part] as Record<string, unknown>
    } else {
      return false
    }
  }

  const lastKey = parts[parts.length - 1]
  if (lastKey in current) {
    delete current[lastKey]
    return true
  }
  return false
}

function cleanEmptyObjects(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleanEmptyObjects(value as Record<string, unknown>)
      if (Object.keys(value as Record<string, unknown>).length === 0) {
        delete obj[key]
      }
    }
  }
}

async function main() {
  console.log(isDryRun ? '🔍 DRY RUN - No files will be modified\n' : '')

  const enPath = path.join(MESSAGES_DIR, 'en.json')
  console.log('Loading translations from', enPath)
  const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
  const namespaces = getNamespaceKeys(enMessages)

  let totalKeys = 0
  for (const keys of namespaces.values()) {
    totalKeys += keys.length
  }
  console.log(`Found ${namespaces.size} namespaces with ${totalKeys} total keys\n`)

  console.log('Scanning codebase for all strings...')
  const codebaseStrings = extractAllStringsFromCodebase()
  console.log(`Found ${codebaseStrings.size} unique strings in codebase\n`)

  const unusedKeys: { namespace: string; key: string }[] = []
  for (const [namespace, keys] of namespaces) {
    for (const key of keys) {
      if (!codebaseStrings.has(key)) {
        unusedKeys.push({ namespace, key })
      }
    }
  }

  console.log('='.repeat(60))
  console.log(`Total keys: ${totalKeys}`)
  console.log(`Unused keys to remove: ${unusedKeys.length}`)
  console.log('='.repeat(60) + '\n')

  if (unusedKeys.length === 0) {
    console.log('✅ No unused keys found!')
    return
  }

  console.log('Keys to remove:')
  let currentNamespace = ''
  for (const { namespace, key } of unusedKeys) {
    if (namespace !== currentNamespace) {
      console.log(`\n[${namespace}]`)
      currentNamespace = namespace
    }
    console.log(`  - ${key}`)
  }

  if (isDryRun) {
    console.log('\n🔍 DRY RUN - Run without --dry-run to remove these keys')
    return
  }

  console.log('\nRemoving keys from locale files...')

  for (const localeFile of LOCALE_FILES) {
    const filePath = path.join(MESSAGES_DIR, localeFile)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  ${localeFile} not found, skipping`)
      continue
    }

    const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    let removedCount = 0

    for (const { namespace, key } of unusedKeys) {
      const fullPath = `${namespace}.${key}`
      if (removeKeyFromObject(messages, fullPath)) {
        removedCount++
      }
    }

    cleanEmptyObjects(messages)
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n')
    console.log(`  ✅ ${localeFile}: removed ${removedCount} keys`)
  }

  console.log('\n✅ Done! Run `pnpm i18n:unused` to verify.')
}

main().catch(console.error)
