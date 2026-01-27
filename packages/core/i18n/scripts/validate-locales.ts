import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MESSAGES_DIR = join(__dirname, '../messages')
const BASE_LOCALE = 'en'

function getKeys(obj: object, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      for (const nested of getKeys(value, fullKey)) {
        keys.add(nested)
      }
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

function findDuplicateKeys(jsonString: string, filename: string): string[] {
  const duplicates: string[] = []
  const lines = jsonString.split('\n')

  // Track seen keys at each nesting level using line-by-line parsing
  // This is a simplified approach that looks for keys at the same indent level
  const keysByIndent: Map<number, Map<string, number>> = new Map()
  const currentIndent = 0

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]
    const trimmed = line.trim()

    // Skip empty lines and lines that are just braces/brackets
    if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed === '[' || trimmed === ']' || trimmed === '},') {
      if (trimmed === '}' || trimmed === '},') {
        // Clear keys at deeper indents when we close a block
        const lineIndent = line.search(/\S/)
        for (const [indent] of keysByIndent) {
          if (indent > lineIndent) {
            keysByIndent.delete(indent)
          }
        }
      }
      continue
    }

    // Match a key at the start of the line (before the colon)
    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/)
    if (keyMatch) {
      const key = keyMatch[1]
      const lineIndent = line.search(/\S/)

      // Clear keys at deeper indents (we've moved up the tree)
      for (const [indent] of keysByIndent) {
        if (indent > lineIndent) {
          keysByIndent.delete(indent)
        }
      }

      if (!keysByIndent.has(lineIndent)) {
        keysByIndent.set(lineIndent, new Map())
      }

      const keysAtLevel = keysByIndent.get(lineIndent)!

      if (keysAtLevel.has(key)) {
        const firstLine = keysAtLevel.get(key)!
        duplicates.push(`${filename}:${lineNum + 1} - key "${key}" (first seen at line ${firstLine})`)
      } else {
        keysAtLevel.set(key, lineNum + 1)
      }
    }
  }

  return duplicates
}

const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'))
const locales: Record<string, object> = {}
let hasErrors = false

for (const file of files) {
  const locale = file.replace('.json', '')
  const filePath = join(MESSAGES_DIR, file)
  const content = readFileSync(filePath, 'utf-8')

  const duplicates = findDuplicateKeys(content, file)
  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      console.error(`❌ Duplicate key: ${dup}`)
    }
    hasErrors = true
  }

  locales[locale] = JSON.parse(content)
}

if (!locales[BASE_LOCALE]) {
  console.error(`❌ Base locale "${BASE_LOCALE}.json" not found`)
  process.exit(1)
}

const baseKeys = getKeys(locales[BASE_LOCALE])

for (const [locale, messages] of Object.entries(locales)) {
  if (locale === BASE_LOCALE) continue
  const localeKeys = getKeys(messages)

  for (const key of baseKeys) {
    if (!localeKeys.has(key)) {
      console.error(`❌ Missing in ${locale}: ${key}`)
      hasErrors = true
    }
  }

  for (const key of localeKeys) {
    if (!baseKeys.has(key)) {
      console.warn(`⚠️  Extra key in ${locale}: ${key}`)
    }
  }
}

if (hasErrors) {
  process.exit(1)
}
console.log(`✅ All ${files.length} locale files have matching keys (no duplicates)`)
