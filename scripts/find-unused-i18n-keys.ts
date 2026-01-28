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

function searchForKey(key: string, namespace: string): boolean {
  // Search for the key in quotes (single or double)
  // Escape special regex chars in the key
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = `['"']${escapedKey}['"']`

  try {
    const result = execSync(
      `grep -r -E "${pattern}" ${SEARCH_DIRS.join(' ')} --include='*.ts' --include='*.tsx' 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    )
    return result.trim().length > 0
  } catch {
    return false
  }
}

async function main() {
  console.log('Loading translations from', MESSAGES_PATH)
  const messages = JSON.parse(fs.readFileSync(MESSAGES_PATH, 'utf-8'))
  const namespaces = getNamespaceKeys(messages)

  console.log(`Found ${namespaces.size} namespaces\n`)

  const unusedKeys: { namespace: string; key: string }[] = []
  let totalKeys = 0

  for (const [namespace, keys] of namespaces) {
    console.log(`Checking namespace: ${namespace} (${keys.length} keys)`)
    totalKeys += keys.length

    for (const key of keys) {
      const found = searchForKey(key, namespace)
      if (!found) {
        unusedKeys.push({ namespace, key })
      }
    }
  }

  console.log('\n' + '='.repeat(60))
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
