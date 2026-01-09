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
function pushEnvVar(key: string, value: string, appName: AppName, vercelEnvs: VercelEnvironment[]): void {
  const appDir = getAppDir(appName)

  // Add the variable with --force to overwrite if exists
  try {
    for (const env of vercelEnvs) {
      execCommand(`printf '%s' "${value}" | vercel env add ${key} ${env} --cwd "${appDir}" --force`, true)
    }
    console.log(chalk.green(`  ✓ ${key}`))
  } catch {
    console.error(chalk.red(`  ✗ ${key} (failed)`))
  }
}

/**
 * Push all env variables for a specific app
 */
function pushEnvsForApp(appName: AppName, vars: Map<string, string>, vercelEnvs: VercelEnvironment[]): void {
  const projectName = VERCEL_APPS[appName]

  console.log(chalk.cyan(`\n📦 Pushing to ${appName} (${projectName})`))
  console.log(chalk.gray(`   Environments: ${vercelEnvs.join(', ')}`))

  // Push each variable
  let successCount = 0
  let errorCount = 0

  for (const [key, value] of vars) {
    try {
      pushEnvVar(key, value, appName, vercelEnvs)
      successCount++
    } catch {
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
  let environment: Environment | undefined
  let targetApp: AppName | 'all' = 'all'

  for (const arg of args) {
    if (arg === 'dev' || arg === 'prod') {
      environment = arg
    } else if (arg === 'all' || arg in VERCEL_APPS) {
      targetApp = arg as AppName | 'all'
    }
  }

  // Validate environment argument
  if (!environment) {
    console.error(
      chalk.red(
        `\nUsage: pnpm env:push <environment> [app]\n\nEnvironments: dev, prod\nApps: ${Object.keys(VERCEL_APPS).join(', ')}, all (default)\n\nExamples:\n  pnpm env:push dev          # Push dev env to all apps\n  pnpm env:push prod app     # Push prod env to app only\n`,
      ),
    )
    process.exit(1)
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

  // Determine Vercel environments based on our environment
  const vercelEnvs: VercelEnvironment[] =
    environment === 'dev'
      ? ['preview'] // dev branch -> preview only
      : ['production', 'preview'] // prod (main) -> production + preview

  console.log(
    `\n${borderBox(
      `Pushing ${environment.toUpperCase()} environment to Vercel`,
      `Target: ${targetApp === 'all' ? 'All apps' : targetApp}`,
      `Vercel environments: ${vercelEnvs.join(', ')}`,
    )}\n`,
  )

  // Merge env files first
  console.log(chalk.blue('📁 Merging environment files...\n'))
  const vars = mergeAndWrite(environment)

  console.log(chalk.blue(`📋 Found ${vars.size} variables to push\n`))

  // Push to apps
  for (const app of apps) {
    pushEnvsForApp(app, vars, vercelEnvs)
  }

  console.log(chalk.green(`\n✅ Done!\n`))
}

main()
