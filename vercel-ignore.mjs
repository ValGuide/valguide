#!/usr/bin/env node

/**
 * Vercel Ignored Build Step script
 * Returns exit code 0 to skip build, 1 to proceed with build
 *
 * Usage in commit messages:
 *   [build vercel]              - Build all apps
 *   [build vercel:app]          - Build only 'valguide-app'
 *   [build vercel:admin]        - Build only 'valguide-admin'
 *   [build vercel:app,admin,www] - Build multiple apps
 *
 * Available scopes: admin, links, www, studio, app, storybook
 * Maps to Vercel projects: valguide-admin, valguide-links, etc.
 */

import { execSync } from 'node:child_process'

const commitMsg = execSync('git log -1 --format=%B', { encoding: 'utf-8' }).trim()
const branch = process.env.VERCEL_GIT_COMMIT_REF ?? ''
const project = process.env.VERCEL_PROJECT_NAME ?? ''
const shortName = project.replace(/^valguide-/, '')

console.log(`Commit message: ${commitMsg}`)
console.log(`Branch: ${branch}`)
console.log(`Project: ${project} (short: ${shortName})`)

// Always build production branch
// if (branch === 'main' || branch === 'production') {
//  console.log('✅ Production branch - proceeding with build')
//  process.exit(1)
//}

// Check for [build vercel] - build all apps
if (commitMsg.includes('[build vercel]')) {
  console.log('✅ [build vercel] found - proceeding with build for all apps')
  process.exit(1)
}

// Check for [build vercel:scope1,scope2,...]
const scopeMatch = commitMsg.match(/\[build vercel:([^\]]+)\]/)
if (scopeMatch) {
  const scopes = scopeMatch[1].split(',').map((s) => s.trim())
  console.log(`Found scoped build request: ${scopes.join(', ')}`)

  if (scopes.includes(shortName)) {
    console.log(`✅ Project '${project}' matches scope '${shortName}' - proceeding with build`)
    process.exit(1)
  }

  console.log(`🚫 Project '${project}' not in scope [${scopes.join(', ')}] - skipping build`)
  process.exit(0)
}

console.log('🚫 No [build vercel] tag found - skipping build')
process.exit(0)
