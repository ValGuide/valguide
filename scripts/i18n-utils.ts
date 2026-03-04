/**
 * Shared utilities for i18n scripts
 */

import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Project, SyntaxKind } from 'ts-morph'

export type MessageSet = {
  dir: string
  localeFiles: string[]
}

export const MESSAGE_SETS: MessageSet[] = [
  { dir: 'packages/core/i18n/messages', localeFiles: ['en.json', 'de.json', 'rm.json'] },
  { dir: 'apps/admin/src/i18n/messages', localeFiles: ['en.json'] },
]

export const BASE_LOCALE = 'en.json'

const SRC_DIRS = ['apps', 'packages']

export function flattenKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const nested of flattenKeys(value as Record<string, unknown>, fullKey)) {
        keys.add(nested)
      }
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

export function findEmptyObjects(obj: Record<string, unknown>, prefix = ''): string[] {
  const emptyPaths: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>
      if (Object.keys(nested).length === 0) {
        emptyPaths.push(fullKey)
      } else {
        emptyPaths.push(...findEmptyObjects(nested, fullKey))
      }
    }
  }
  return emptyPaths
}

export function loadTranslations(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function findFilesWithTranslations(): string[] {
  const result = execSync(
    `grep -rl "useTranslations\\|getTranslations" ${SRC_DIRS.join(' ')} --include='*.ts' --include='*.tsx' 2>/dev/null || true`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
  )
  return result.trim().split('\n').filter(Boolean)
}

// Extract all string literals from a node (handles ternaries, nested expressions)
function extractStringLiteralsFromNode(node: import('ts-morph').Node): string[] {
  const literals: string[] = []
  node.forEachDescendant((child) => {
    if (child.getKind() === SyntaxKind.StringLiteral) {
      literals.push(child.getText().slice(1, -1))
    }
  })
  return literals
}

export function extractUsedKeys(): Set<string> {
  const files = findFilesWithTranslations()
  console.log(`Found ${files.length} files using translations`)

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true },
  })

  for (const file of files) {
    project.addSourceFileAtPath(file)
  }

  const usedKeys = new Set<string>()

  for (const file of project.getSourceFiles()) {
    const namespaceMap = new Map<string, string>()

    // Check for i18n-used-keys comments: // i18n-used-keys: namespace.key1, namespace.key2
    const sourceText = file.getFullText()
    const commentMatches = sourceText.matchAll(/\/\/\s*i18n-used-keys:\s*(.+)/g)
    for (const match of commentMatches) {
      const keys = match[1].split(',').map((k) => k.trim())
      for (const key of keys) {
        usedKeys.add(key)
      }
    }

    // Track: const t = useTranslations('namespace') or useTranslations(cond ? 'ns1' : 'ns2')
    file.forEachDescendant((node) => {
      if (node.getKind() === SyntaxKind.VariableDeclaration) {
        const init = node.asKind(SyntaxKind.VariableDeclaration)?.getInitializer()
        if (!init || init.getKind() !== SyntaxKind.CallExpression) return

        const call = init.asKind(SyntaxKind.CallExpression)
        if (!call) return

        const expr = call.getExpression().getText()
        if (expr === 'useTranslations' || expr === 'getTranslations') {
          const varDecl = node.asKind(SyntaxKind.VariableDeclaration)
          if (!varDecl) return

          const args = call.getArguments()
          if (args.length === 0) {
            // No namespace: useTranslations() - keys are full paths like 'stops.actions.addError'
            namespaceMap.set(varDecl.getName(), '')
          } else {
            const arg = args[0]
            if (arg.getKind() === SyntaxKind.StringLiteral) {
              // Simple: useTranslations('namespace') or useTranslations('nested.namespace')
              const ns = arg.getText().slice(1, -1)
              namespaceMap.set(varDecl.getName(), ns)
            } else if (arg.getKind() === SyntaxKind.ConditionalExpression) {
              // Ternary: useTranslations(isLogin ? 'login' : 'signup')
              const namespaces = extractStringLiteralsFromNode(arg)
              for (const ns of namespaces) {
                // Store multiple namespaces with same variable name using array
                const existing = namespaceMap.get(varDecl.getName())
                if (existing) {
                  namespaceMap.set(varDecl.getName(), `${existing}|${ns}`)
                } else {
                  namespaceMap.set(varDecl.getName(), ns)
                }
              }
            }
          }
        }
      }
    })

    // Match calls like t("key") or t.rich("key") or t(cond ? "key1" : "key2")
    file.forEachDescendant((node) => {
      if (node.getKind() === SyntaxKind.CallExpression) {
        const call = node.asKind(SyntaxKind.CallExpression)
        if (!call) return

        const exprText = call.getExpression().getText()
        const args = call.getArguments()

        let varName: string | undefined
        if (namespaceMap.has(exprText)) {
          varName = exprText
        } else if (exprText.includes('.')) {
          const [base] = exprText.split('.')
          if (namespaceMap.has(base)) {
            varName = base
          }
        }

        if (varName && args.length > 0) {
          const arg = args[0]
          const namespaceValue = namespaceMap.get(varName) ?? ''
          // Handle multiple namespaces (from ternary in useTranslations)
          const namespaces = namespaceValue.split('|')

          // Helper to build full key, handling empty namespace
          const buildFullKey = (ns: string, key: string) => (ns ? `${ns}.${key}` : key)

          if (arg.getKind() === SyntaxKind.StringLiteral) {
            // Simple: t('key') or t('nested.key')
            const key = arg.getText().slice(1, -1)
            for (const ns of namespaces) {
              usedKeys.add(buildFullKey(ns, key))
            }
          } else if (arg.getKind() === SyntaxKind.ConditionalExpression) {
            // Ternary: t(isLogin ? 'loginPrompt' : 'signupPrompt')
            const keys = extractStringLiteralsFromNode(arg)
            for (const key of keys) {
              for (const ns of namespaces) {
                usedKeys.add(buildFullKey(ns, key))
              }
            }
          }
        }
      }
    })
  }

  return usedKeys
}

export function findUnusedKeys(existingKeys: Set<string>, usedKeys: Set<string>): string[] {
  return [...existingKeys].filter((key) => !usedKeys.has(key)).sort()
}

export function printUnusedKeys(unusedKeys: string[]): void {
  let currentNamespace = ''
  for (const key of unusedKeys) {
    const namespace = key.split('.')[0]
    if (namespace !== currentNamespace) {
      console.log(`\n[${namespace}]`)
      currentNamespace = namespace
    }
    console.log(`  - ${key.substring(namespace.length + 1)}`)
  }
}

function findDuplicateKeys(jsonString: string, filename: string): string[] {
  const duplicates: string[] = []
  const lines = jsonString.split('\n')
  const keysByIndent: Map<number, Map<string, number>> = new Map()

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]
    const trimmed = line.trim()

    if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed === '[' || trimmed === ']' || trimmed === '},') {
      if (trimmed === '}' || trimmed === '},') {
        const lineIndent = line.search(/\S/)
        for (const [indent] of keysByIndent) {
          if (indent > lineIndent) {
            keysByIndent.delete(indent)
          }
        }
      }
      continue
    }

    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/)
    if (keyMatch) {
      const key = keyMatch[1]
      const lineIndent = line.search(/\S/)

      for (const [indent] of keysByIndent) {
        if (indent > lineIndent) {
          keysByIndent.delete(indent)
        }
      }

      if (!keysByIndent.has(lineIndent)) {
        keysByIndent.set(lineIndent, new Map())
      }

      const keysAtLevel = keysByIndent.get(lineIndent)
      if (!keysAtLevel) {
        continue
      }
      if (keysAtLevel.has(key)) {
        const firstLine = keysAtLevel.get(key)
        if (!firstLine) {
          continue
        }
        duplicates.push(`${filename}:${lineNum + 1} - key "${key}" (first seen at line ${firstLine})`)
      } else {
        keysAtLevel.set(key, lineNum + 1)
      }
    }
  }

  return duplicates
}

export function validateMessagesDir(messagesDir: string): boolean {
  const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'))
  const locales: Record<string, object> = {}
  let hasErrors = false
  const baseLocale = 'en'

  for (const file of files) {
    const locale = file.replace('.json', '')
    const filePath = path.join(messagesDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    const duplicates = findDuplicateKeys(content, file)
    if (duplicates.length > 0) {
      for (const dup of duplicates) {
        console.error(`❌ Duplicate key: ${dup}`)
      }
      hasErrors = true
    }

    locales[locale] = JSON.parse(content)
  }

  if (!locales[baseLocale]) {
    console.error(`❌ Base locale "${baseLocale}.json" not found in ${messagesDir}`)
    return false
  }

  const baseKeys = flattenKeys(locales[baseLocale] as Record<string, unknown>)

  for (const [locale, messages] of Object.entries(locales)) {
    if (locale === baseLocale) continue
    const localeKeys = flattenKeys(messages as Record<string, unknown>)

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

  if (!hasErrors) {
    console.log(`✅ ${files.length} locale file(s) valid (no duplicates${files.length > 1 ? ', keys in sync' : ''})`)
  }

  return !hasErrors
}
