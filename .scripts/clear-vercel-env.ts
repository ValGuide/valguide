#!/usr/bin/env tsx
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { borderBox } from './border-box'

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
    throw error
  }
}

/**
 * Get the app directory path
 */
function getAppDir(appName: AppName): string {
  return join(ROOT_DIR, 'apps', appName)
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

interface EnvVar {
  name: string
  environments: string[]
  gitBranch?: string
}

/**
 * Get all env variables for an app from Vercel, optionally filtered by branch
 */
function getVercelEnvVars(appName: AppName, gitBranch?: string): EnvVar[] {
  const appDir = getAppDir(appName)
  try {
    const output = execCommand(`vercel env ls --cwd "${appDir}" 2>&1`, true)
    const lines = output.split('\n')
    const vars: EnvVar[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      // Skip header lines, empty lines, and info lines
      if (
        !trimmed ||
        trimmed.startsWith('Vercel') ||
        trimmed.startsWith('Retrieving') ||
        trimmed.startsWith('>') ||
        trimmed.startsWith('Common') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('name')
      ) {
        continue
      }

      // Parse lines like: " VAR_NAME    Encrypted    Preview    4m ago"
      // Or with branch: " VAR_NAME    Encrypted    Preview (dev)    71d ago"
      const parts = trimmed.split(/\s{2,}/)
      if (parts.length >= 3 && parts[0] && !parts[0].includes(' ')) {
        const name = parts[0]
        const envString = parts[2] ?? '' // environments is the 3rd column (after name and value)

        // Parse environments like "Preview (dev)" or "Development, Preview, Production"
        const envParts = envString.split(',').map((e) => e.trim())
        const environments: string[] = []
        let matchesBranch = !gitBranch // If no branch specified, match all

        for (const envPart of envParts) {
          // Check for branch notation like "Preview (dev)"
          const branchMatch = envPart.match(/^(\w+)\s*\(([^)]+)\)$/)
          if (branchMatch) {
            const env = branchMatch[1]?.toLowerCase() ?? ''
            const branch = branchMatch[2]
            environments.push(env)
            if (gitBranch && branch === gitBranch) {
              matchesBranch = true
            }
          } else {
            environments.push(envPart.toLowerCase())
            if (!gitBranch) {
              matchesBranch = true
            }
          }
        }

        // Only include vars that match the branch filter (or have no branch = global)
        if (matchesBranch || !gitBranch) {
          vars.push({ name, environments, gitBranch })
        }
      }
    }

    return vars
  } catch (e) {
    console.error(chalk.red(`Failed to get env vars: ${e}`))
    return []
  }
}

/**
 * Remove a single env variable from Vercel
 */
function removeEnvVar(key: string, appName: AppName, vercelEnv: VercelEnvironment, gitBranch?: string): boolean {
  const appDir = getAppDir(appName)
  try {
    const branchArg = gitBranch ? ` ${gitBranch}` : ''
    execCommand(`vercel env rm ${key} ${vercelEnv}${branchArg} --cwd "${appDir}" -y 2>&1`, true)
    return true
  } catch {
    return false
  }
}

/**
 * Clear all env variables for a specific app and environment
 */
function clearEnvsForApp(appName: AppName, vercelEnv: VercelEnvironment, gitBranch?: string): void {
  const projectName = VERCEL_APPS[appName]

  console.log(chalk.cyan(`\n🗑️  Clearing env vars from ${appName} (${projectName})`))
  const envLabel = gitBranch ? `${vercelEnv} (${gitBranch})` : vercelEnv
  console.log(chalk.gray(`   Environment: ${envLabel}`))

  // Get all env variables
  const allVars = getVercelEnvVars(appName, gitBranch)

  if (allVars.length === 0) {
    console.log(chalk.yellow(`   No environment variables found`))
    return
  }

  // Filter vars that exist in the target environment
  const varsToRemove = allVars.filter((v) => v.environments.includes(vercelEnv))

  if (varsToRemove.length === 0) {
    console.log(chalk.yellow(`   No environment variables found for ${envLabel}`))
    return
  }

  console.log(chalk.gray(`   Found ${varsToRemove.length} variables to remove\n`))

  let successCount = 0
  let errorCount = 0

  for (const envVar of varsToRemove) {
    const success = removeEnvVar(envVar.name, appName, vercelEnv, gitBranch)
    if (success) {
      console.log(chalk.green(`  ✓ ${envVar.name}`))
      successCount++
    } else {
      console.error(chalk.red(`  ✗ ${envVar.name}`))
      errorCount++
    }
  }

  console.log(chalk.green(`\n✓ Removed ${successCount} variables from ${appName}`))
  if (errorCount > 0) {
    console.log(chalk.red(`✗ Failed to remove ${errorCount} variables`))
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  let vercelEnv: VercelEnvironment | undefined
  let targetApp: AppName | undefined
  let gitBranch: string | undefined

  // First pass: identify known arguments
  const knownArgs = new Set<string>(['preview', 'production', ...Object.keys(VERCEL_APPS)])

  for (const arg of args) {
    if (arg === 'preview' || arg === 'production') {
      vercelEnv = arg
    } else if (arg in VERCEL_APPS) {
      targetApp = arg as AppName
    } else if (!knownArgs.has(arg)) {
      // Assume unknown args are git branch names
      gitBranch = arg
    }
  }

  // Validate arguments - both environment and app are required
  if (!vercelEnv || !targetApp) {
    console.error(
      chalk.red(
        `\nUsage: pnpm env:clear <vercel-environment> <app> [git-branch]

Vercel Environments: preview, production
Apps: ${Object.keys(VERCEL_APPS).join(', ')}
Git Branch: Optional branch name for preview environment

Examples:
  pnpm env:clear preview app          # Clear preview env from app
  pnpm env:clear production studio    # Clear production env from studio
  pnpm env:clear preview app feat-1   # Clear preview env for branch 'feat-1' from app
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

  // Check if project is linked
  const linkStatus = checkAppLinkStatus(targetApp)
  if (!linkStatus.isLinked) {
    console.error(chalk.red(`\n✗ App "${targetApp}" is not linked to Vercel\n`))
    console.error(chalk.yellow(`   Expected project: ${VERCEL_APPS[targetApp]}`))
    console.error(chalk.cyan(`\nTo link this project, run:\n`))
    console.error(chalk.white(`   cd apps/${targetApp} && vercel link`))
    console.error('')
    process.exit(1)
  }

  const envLabel = gitBranch ? `${vercelEnv.toUpperCase()} (${gitBranch})` : vercelEnv.toUpperCase()

  console.log(`\n${borderBox(`Clearing ${envLabel} environment from Vercel`, `Target: ${targetApp}`)}\n`)

  // Clear env vars from app
  clearEnvsForApp(targetApp, vercelEnv, gitBranch)

  console.log(chalk.green(`\n✅ Done!\n`))
}

main()
