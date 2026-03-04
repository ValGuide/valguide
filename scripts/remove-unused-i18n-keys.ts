#!/usr/bin/env npx tsx
/**
 * Remove unused i18n translation keys from all locale files
 * Usage: npx tsx scripts/remove-unused-i18n-keys.ts [--dry-run]
 */

import * as fs from 'node:fs'
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

const isDryRun = process.argv.includes('--dry-run')

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
  console.log(`Unused keys to remove: ${unusedKeys.length}`)
  console.log(`Empty objects to remove: ${emptyObjects.length}`)
  console.log('='.repeat(60))

  if (emptyObjects.length > 0) {
    console.log('\nEmpty objects to remove:')
    for (const path of emptyObjects) {
      console.log(`  - ${path}`)
    }
  }

  if (unusedKeys.length === 0 && emptyObjects.length === 0) {
    console.log('\n✅ No unused keys or empty objects found!')
    return
  }

  if (unusedKeys.length > 0) {
    console.log('\nKeys to remove:')
    printUnusedKeys(unusedKeys)
  }

  if (isDryRun) {
    console.log('\n🔍 DRY RUN - Run without --dry-run to remove these keys')
    return
  }

  console.log('\nRemoving keys from locale files...')

  for (const set of MESSAGE_SETS) {
    for (const localeFile of set.localeFiles) {
      const filePath = path.join(set.dir, localeFile)
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  ${filePath} not found, skipping`)
        continue
      }

      const localeMessages = loadTranslations(filePath)
      let removedCount = 0

      for (const fullKey of unusedKeys) {
        if (removeKeyFromObject(localeMessages, fullKey)) {
          removedCount++
        }
      }

      cleanEmptyObjects(localeMessages)
      fs.writeFileSync(filePath, `${JSON.stringify(localeMessages, null, 2)}\n`)
      console.log(`  ✅ ${filePath}: removed ${removedCount} keys`)
    }
  }

  console.log('\n✅ Done! Run `pnpm i18n:unused` and `pnpm type-check` to verify.')
}

main().catch(console.error)
