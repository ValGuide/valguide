#!/usr/bin/env npx tsx
/**
 * Find unused i18n translation keys
 * Usage: npx tsx scripts/find-unused-i18n-keys.ts
 */

import { execSync } from 'node:child_process'
import * as fs from 'node:fs'

const MESSAGES_PATH = 'packages/core/i18n/messages/en.json'
const SEARCH_DIRS = ['apps', 'packages']

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
  // Use ripgrep to find all quoted strings in one pass
  // This regex captures content inside single or double quotes
  const result = execSync(
    `rg -o "['\\"]([^'\\"]+)['\\"]" ${SEARCH_DIRS.join(' ')} --include='*.ts' --include='*.tsx' -I --no-filename 2>/dev/null || true`,
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 },
  )

  const strings = new Set<string>()
  for (const line of result.split('\n')) {
    // Remove surrounding quotes
    const match = line.match(/^['"](.+)['"]$/)
    if (match) {
      strings.add(match[1])
    }
  }
  return strings
}

async function main() {
  console.log('Loading translations from', MESSAGES_PATH)
  const messages = JSON.parse(fs.readFileSync(MESSAGES_PATH, 'utf-8'))
  const namespaces = getNamespaceKeys(messages)

  let totalKeys = 0
  for (const keys of namespaces.values()) {
    totalKeys += keys.length
  }
  console.log(`Found ${namespaces.size} namespaces with ${totalKeys} total keys\n`)

  console.log('Scanning codebase for all strings (this is the slow part)...')
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
  console.log(`Unused keys: ${unusedKeys.length}`)
  console.log('='.repeat(60) + '\n')

  if (unusedKeys.length > 0) {
    console.log('Potentially unused keys:')
    let currentNamespace = ''
    for (const { namespace, key } of unusedKeys) {
      if (namespace !== currentNamespace) {
        console.log(`\n[${namespace}]`)
        currentNamespace = namespace
      }
      console.log(`  - ${key}`)
    }
  }
}

main().catch(console.error)
