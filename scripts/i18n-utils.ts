/**
 * Shared utilities for i18n scripts
 */

import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import { Project, SyntaxKind } from 'ts-morph'

export const MESSAGES_DIR = 'packages/core/i18n/messages'
export const MESSAGES_PATH = `${MESSAGES_DIR}/en.json`
export const LOCALE_FILES = ['en.json', 'de.json', 'rm.json']
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
          const args = call.getArguments()
          if (args.length > 0) {
            const varDecl = node.asKind(SyntaxKind.VariableDeclaration)
            if (!varDecl) return

            const arg = args[0]
            if (arg.getKind() === SyntaxKind.StringLiteral) {
              // Simple: useTranslations('namespace')
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

          if (arg.getKind() === SyntaxKind.StringLiteral) {
            // Simple: t('key')
            const key = arg.getText().slice(1, -1)
            for (const ns of namespaces) {
              usedKeys.add(`${ns}.${key}`)
            }
          } else if (arg.getKind() === SyntaxKind.ConditionalExpression) {
            // Ternary: t(isLogin ? 'loginPrompt' : 'signupPrompt')
            const keys = extractStringLiteralsFromNode(arg)
            for (const key of keys) {
              for (const ns of namespaces) {
                usedKeys.add(`${ns}.${key}`)
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
