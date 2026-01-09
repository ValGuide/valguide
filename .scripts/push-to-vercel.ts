#!/usr/bin/env tsx
import { exec } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import chalk from 'chalk'
import { borderBox } from './border-box'
import { type Environment, mergeAndWrite } from './merge-env'

const execAsync = promisify(exec)

type VercelEnvironment = 'production' | 'preview'

const ROOT_DIR = join(__dirname, '..')

// Number of concurrent env pushes (too many can cause rate limiting)
const CONCURRENCY = 5

// TanStack Start apps that are deployed to Vercel
// Maps app folder name to Vercel project name
const VERCEL_APPS = {
  app: 'valguide-app',
  studio: 'valguide-studio',
  admin: 'valguide-admin',
  www: 'valguide-www',
  links: 'valguide-links',
} as const

type AppName = keyof typeof VERCEL_APPS

/**
 * Get the app directory path
 */
function getAppDir(appName: AppName): string {
  return join(ROOT_DIR, 'apps', appName)
}

/**
 * Push a single env variable to Vercel using --force to overwrite if exists
 */
async function pushEnvVar(
  key: string,
  value: string,
  appName: AppName,
  vercelEnv: VercelEnvironment,
  gitBranch?: string,
): Promise<{ key: string; success: boolean }> {
  const appDir = getAppDir(appName)
  const branchArg = gitBranch ? ` ${gitBranch}` : ''

  try {
    await execAsync(`printf '%s' "${value}" | vercel env add ${key} ${vercelEnv}${branchArg} --cwd "${appDir}" --force`)
    return { key, success: true }
  } catch {
    return { key, success: false }
  }
}

/**
 * Run promises with concurrency limit
 */
async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const p = task().then((result) => {
      results.push(result)
    })

    executing.push(p)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      // Remove completed promises
      for (let i = executing.length - 1; i >= 0; i--) {
        // Check if promise is settled by racing with an immediately resolved promise
        const settled = await Promise.race([executing[i]!.then(() => true), Promise.resolve(false)])
        if (settled) {
          executing.splice(i, 1)
        }
      }
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * Push all env variables for a specific app (parallel)
 */
async function pushEnvsForApp(
  appName: AppName,
  vars: Map<string, string>,
  vercelEnv: VercelEnvironment,
  gitBranch?: string,
): Promise<void> {
  const projectName = VERCEL_APPS[appName]
  const envLabel = gitBranch ? `${vercelEnv} (${gitBranch})` : vercelEnv

  console.log(chalk.cyan(`\n📦 Pushing to ${appName} (${projectName})`))
  console.log(chalk.gray(`   Environment: ${envLabel}`))
  console.log(chalk.gray(`   Pushing ${vars.size} variables (${CONCURRENCY} concurrent)...\n`))

  // Create tasks for parallel execution
  const tasks = Array.from(vars.entries()).map(
    ([key, value]) =>
      () =>
        pushEnvVar(key, value, appName, vercelEnv, gitBranch),
  )

  // Run with concurrency limit
  const results = await runWithConcurrency(tasks, CONCURRENCY)

  // Report results
  let successCount = 0
  let errorCount = 0

  for (const result of results) {
    if (result.success) {
      console.log(chalk.green(`  ✓ ${result.key}`))
      successCount++
    } else {
      console.error(chalk.red(`  ✗ ${result.key} (failed)`))
      errorCount++
    }
  }

  console.log(chalk.green(`\n✓ Pushed ${successCount}/${vars.size} variables to ${appName}`))
  if (errorCount > 0) {
    console.log(chalk.red(`✗ Failed to push ${errorCount} variables`))
  }
}

interface LinkStatus {
  isLinked: boolean
  projectId?: string
  orgId?: string
}

/**
 * Check if an app is linked to Vercel by checking for .vercel/project.json
 */
function checkAppLinkStatus(appName: AppName): LinkStatus {
  const projectJsonPath = join(ROOT_DIR, 'apps', appName, '.vercel', 'project.json')

  if (!existsSync(projectJsonPath)) {
    return { isLinked: false }
  }

  try {
    const content = readFileSync(projectJsonPath, 'utf-8')
    const config = JSON.parse(content)
    return {
      isLinked: true,
      projectId: config.projectId,
      orgId: config.orgId,
    }
  } catch {
    return { isLinked: false }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  // Format: pnpm env:push <vercel-env> <app> [source-env]
  // - vercel-env: preview or prod (prod pushes to both production and preview)
  // - app: app name or 'all'
  // - source-env: dev or prod (which .secrets files to use), defaults based on vercel-env
  let vercelEnv: VercelEnvironment | 'prod' | undefined
  let targetApp: AppName | 'all' = 'all'
  let sourceEnv: Environment | undefined
  let gitBranch: string | undefined

  // Known arguments
  const knownArgs = new Set<string>(['preview', 'prod', 'dev', 'all', ...Object.keys(VERCEL_APPS)])

  for (const arg of args) {
    if (arg === 'preview' || arg === 'prod') {
      vercelEnv = arg
    } else if (arg === 'dev') {
      // 'dev' can be either source env or is implied
      sourceEnv = 'dev'
    } else if (arg === 'all' || arg in VERCEL_APPS) {
      targetApp = arg as AppName | 'all'
    } else if (!knownArgs.has(arg)) {
      // Unknown args are git branch names (only for preview)
      gitBranch = arg
    }
  }

  // Validate vercel environment argument
  if (!vercelEnv) {
    console.error(
      chalk.red(
        `\nUsage: pnpm env:push <vercel-env> <app> [git-branch]

Vercel Environments: preview, prod
Apps: ${Object.keys(VERCEL_APPS).join(', ')}, all (default)
Git Branch: Optional branch name for preview environment

Examples:
  pnpm env:push preview app           # Push dev secrets to preview env for app
  pnpm env:push preview app dev       # Push dev secrets to preview env for branch 'dev'
  pnpm env:push prod app              # Push prod secrets to production + preview for app
  pnpm env:push prod all              # Push prod secrets to production + preview for all apps
`,
      ),
    )
    process.exit(1)
  }

  // Git branch only makes sense for preview environment
  if (gitBranch && vercelEnv !== 'preview') {
    console.error(chalk.red(`\n✗ Git branch can only be specified for 'preview' environment\n`))
    process.exit(1)
  }

  // Determine source environment (which secrets to use)
  // - preview -> dev secrets
  // - prod -> prod secrets
  if (!sourceEnv) {
    sourceEnv = vercelEnv === 'preview' ? 'dev' : 'prod'
  }

  // Check if projects are linked
  const apps = targetApp === 'all' ? (Object.keys(VERCEL_APPS) as AppName[]) : [targetApp]
  const unlinkedApps: AppName[] = []

  for (const app of apps) {
    const linkStatus = checkAppLinkStatus(app)
    if (!linkStatus.isLinked) {
      unlinkedApps.push(app)
    }
  }

  if (unlinkedApps.length > 0) {
    console.error(chalk.red(`\n✗ The following apps are not linked to Vercel:\n`))
    for (const app of unlinkedApps) {
      console.error(chalk.yellow(`   • ${app} (expected project: ${VERCEL_APPS[app]})`))
    }
    console.error(chalk.cyan(`\nTo link these projects, run the following commands:\n`))
    for (const app of unlinkedApps) {
      console.error(chalk.white(`   cd apps/${app} && vercel link`))
    }
    console.error(chalk.gray(`\nWhen prompted:`))
    console.error(chalk.gray(`   • Select your Vercel scope/team`))
    console.error(chalk.gray(`   • Link to existing project OR create new project`))
    console.error(chalk.gray(`   • Use project name: ${chalk.white('<app-project-name>')}\n`))
    console.error(chalk.gray(`Expected project names:`))
    for (const app of unlinkedApps) {
      console.error(chalk.gray(`   • ${app} → ${chalk.white(VERCEL_APPS[app])}`))
    }
    console.error('')
    process.exit(1)
  }

  // Determine Vercel environments to push to
  const vercelEnvs: VercelEnvironment[] = vercelEnv === 'prod' ? ['production', 'preview'] : ['preview']

  const envLabel = gitBranch ? `${vercelEnv.toUpperCase()} (branch: ${gitBranch})` : vercelEnv.toUpperCase()

  console.log(
    `\n${borderBox(
      `Pushing to Vercel ${envLabel}`,
      `Source: ${sourceEnv} secrets`,
      `Target: ${targetApp === 'all' ? 'All apps' : targetApp}`,
      `Vercel environments: ${vercelEnvs.join(', ')}`,
    )}\n`,
  )

  // Merge env files first
  console.log(chalk.blue('📁 Merging environment files...\n'))
  const vars = mergeAndWrite(sourceEnv)

  console.log(chalk.blue(`📋 Found ${vars.size} variables to push\n`))

  // Push to apps
  for (const app of apps) {
    for (const env of vercelEnvs) {
      // Only apply gitBranch to preview environment
      const branch = env === 'preview' ? gitBranch : undefined
      await pushEnvsForApp(app, vars, env, branch)
    }
  }

  console.log(chalk.green(`\n✅ Done!\n`))
}

main().catch((err) => {
  console.error(chalk.red(`\n✗ Error: ${err.message}\n`))
  process.exit(1)
})
