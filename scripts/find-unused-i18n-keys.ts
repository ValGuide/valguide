#!/usr/bin/env npx tsx
/**
 * Find unused i18n translation keys using AST parsing
 * Usage: npx tsx scripts/find-unused-i18n-keys.ts
 */

import * as path from 'node:path'
import {
  BASE_LOCALE,
  extractUsedKeys,
  findEmptyObjects,
  findUnusedKeys,
  flattenKeys,
  loadTranslations,
  MESSAGE_SETS,
  printUnusedKeys,
} from './i18n-utils'

async function main() {
  const existingKeys = new Set<string>()
  const emptyObjects: string[] = []

  for (const set of MESSAGE_SETS) {
    const filePath = path.join(set.dir, BASE_LOCALE)
    console.log('Loading translations from', filePath)
    const messages = loadTranslations(filePath)
    for (const key of flattenKeys(messages)) {
      existingKeys.add(key)
    }
    emptyObjects.push(...findEmptyObjects(messages))
  }
  console.log(`Found ${existingKeys.size} translation keys\n`)

  console.log('Parsing source files with ts-morph...')
  const usedKeys = extractUsedKeys()
  console.log(`Found ${usedKeys.size} used translation keys\n`)

  const unusedKeys = findUnusedKeys(existingKeys, usedKeys)

  console.log('='.repeat(60))
  console.log(`Total keys: ${existingKeys.size}`)
  console.log(`Used keys: ${usedKeys.size}`)
  console.log(`Unused keys: ${unusedKeys.length}`)
  console.log(`Empty objects: ${emptyObjects.length}`)
  console.log('='.repeat(60))

  if (emptyObjects.length > 0) {
    console.log('\nEmpty objects (will be removed):')
    for (const path of emptyObjects) {
      console.log(`  - ${path}`)
    }
  }

  if (unusedKeys.length > 0) {
    console.log('\nPotentially unused keys:')
    printUnusedKeys(unusedKeys)
  }

  if (unusedKeys.length === 0 && emptyObjects.length === 0) {
    console.log('\n✅ No unused keys or empty objects found!')
  }
}

main().catch(console.error)
