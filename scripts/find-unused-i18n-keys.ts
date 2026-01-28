#!/usr/bin/env npx tsx
/**
 * Find unused i18n translation keys using AST parsing
 * Usage: npx tsx scripts/find-unused-i18n-keys.ts
 */

import {
  extractUsedKeys,
  findUnusedKeys,
  flattenKeys,
  loadTranslations,
  MESSAGES_PATH,
  printUnusedKeys,
} from './i18n-utils'

async function main() {
  console.log('Loading translations from', MESSAGES_PATH)
  const messages = loadTranslations(MESSAGES_PATH)
  const existingKeys = flattenKeys(messages)
  console.log(`Found ${existingKeys.size} translation keys\n`)

  console.log('Parsing source files with ts-morph...')
  const usedKeys = extractUsedKeys()
  console.log(`Found ${usedKeys.size} used translation keys\n`)

  const unusedKeys = findUnusedKeys(existingKeys, usedKeys)

  console.log('='.repeat(60))
  console.log(`Total keys: ${existingKeys.size}`)
  console.log(`Used keys: ${usedKeys.size}`)
  console.log(`Unused keys: ${unusedKeys.length}`)
  console.log('='.repeat(60))

  if (unusedKeys.length > 0) {
    console.log('\nPotentially unused keys:')
    printUnusedKeys(unusedKeys)
  } else {
    console.log('\n✅ No unused keys found!')
  }
}

main().catch(console.error)
