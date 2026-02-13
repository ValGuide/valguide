#!/usr/bin/env npx tsx
/**
 * Validate all i18n locale message directories
 * Usage: npx tsx scripts/validate-locales.ts
 */

import { MESSAGE_SETS, validateMessagesDir } from './i18n-utils'

let hasErrors = false

for (const set of MESSAGE_SETS) {
  console.log(`\nValidating ${set.dir}...`)
  if (!validateMessagesDir(set.dir)) {
    hasErrors = true
  }
}

if (hasErrors) {
  process.exit(1)
}
