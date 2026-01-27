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

const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'))
const locales: Record<string, object> = {}

for (const file of files) {
  const locale = file.replace('.json', '')
  const content = readFileSync(join(MESSAGES_DIR, file), 'utf-8')
  locales[locale] = JSON.parse(content)
}

if (!locales[BASE_LOCALE]) {
  console.error(`❌ Base locale "${BASE_LOCALE}.json" not found`)
  process.exit(1)
}

const baseKeys = getKeys(locales[BASE_LOCALE])
let hasErrors = false

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
console.log(`✅ All ${files.length} locale files have matching keys`)
