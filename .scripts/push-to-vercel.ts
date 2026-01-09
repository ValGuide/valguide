#!/usr/bin/env tsx
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { borderBox } from './border-box'
import { type Environment, mergeAndWrite } from './merge-env'

type VercelEnvironment = 'production' | 'preview'

const ROOT_DIR = join(__dirname, '..')

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
 * Execute a shell command and return output
 */
function execCommand(command: string, silent = false): string {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    })
  } catch (error) {
    console.error(chalk.red(`Failed to execute: ${command}`))
    throw error
  }
}

/**
 * Get the app directory path
 */
function getAppDir(appName: AppName): string {
  return join(ROOT_DIR, 'apps', appName)
}

/**
 * Push a single env variable to Vercel using --force to overwrite if exists
 */
function pushEnvVar(
  key: string,
  value: string,
  appName: AppName,
  vercelEnv: VercelEnvironment,
  gitBranch?: string,
): void {
  const appDir = getAppDir(appName)
  const branchArg = gitBranch ? ` ${gitBranch}` : ''

  // Add the variable with --force to overwrite if exists
  try {
    execCommand(
      `printf '%s' "${value}" | vercel env add ${key} ${vercelEnv}${branchArg} --cwd "${appDir}" --force`,
      true,
    )
  } catch {
    throw new Error(`Failed to push ${key}`)
  }
}

/**
 * Push all env variables for a specific app
 */
function pushEnvsForApp(
  appName: AppName,
  vars: Map<string, string>,
  vercelEnv: VercelEnvironment,
  gitBranch?: string,
): void {
  const projectName = VERCEL_APPS[appName]
  const envLabel = gitBranch ? `${vercelEnv} (${gitBranch})` : vercelEnv

  console.log(chalk.cyan(`\n📦 Pushing to ${appName} (${projectName})`))
  console.log(chalk.gray(`   Environment: ${envLabel}`))

  // Push each variable
  let successCount = 0
  let errorCount = 0

  for (const [key, value] of vars) {
    try {
      pushEnvVar(key, value, appName, vercelEnv, gitBranch)
      console.log(chalk.green(`  ✓ ${key}`))
      successCount++
    } catch {
      console.error(chalk.red(`  ✗ ${key} (failed)`))
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
function main() {
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
      pushEnvsForApp(app, vars, env, branch)
    }
  }

  console.log(chalk.green(`\n✅ Done!\n`))
}

main()
