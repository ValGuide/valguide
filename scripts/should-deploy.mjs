#!/usr/bin/env node

/**
 * Check if an app should be deployed based on commit message tags.
 * Exit 0 = deploy, Exit 1 = skip
 *
 * Usage: node should-deploy.mjs <app-name>
 *
 * Commit message tags:
 *   [build all]                - Deploy all apps
 *   [build studio]             - Deploy only studio
 *   [build admin,studio]       - Deploy admin and studio
 *   [build studio admin]       - Space-separated apps
 *   [build studio] [build app] - Multiple tags
 */

import { execSync } from 'node:child_process'

const appName = process.argv[2]
if (!appName) {
  console.error('Usage: node should-deploy.mjs <app-name>')
  process.exit(1)
}

const commitMsg = execSync('git log -1 --format=%B', { encoding: 'utf-8' }).trim()

console.log(`Commit message: ${commitMsg}`)
console.log(`App: ${appName}`)

// [build all] - deploy everything
if (commitMsg.includes('[build all]')) {
  console.log(`✅ [build all] found — deploying ${appName}`)
  process.exit(0)
}

// Parse [build scope1,scope2,...] or [build scope1 scope2 ...]
// Supports multiple tags: [build app] [build admin]
const scopeMatches = [...commitMsg.matchAll(/\[build ([^\]]+)\]/g)]
if (scopeMatches.length > 0) {
  const scopes = scopeMatches.flatMap((m) =>
    m[1].split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
  )
  console.log(`Found scoped build request: ${scopes.join(', ')}`)

  if (scopes.includes(appName)) {
    console.log(`✅ '${appName}' matches scope — deploying`)
    process.exit(0)
  }

  console.log(`🚫 '${appName}' not in scope [${scopes.join(', ')}] — skipping`)
  process.exit(1)
}

console.log('🚫 No [build] tag found — skipping deploy')
process.exit(1)
