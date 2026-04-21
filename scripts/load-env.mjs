import { execSync } from 'node:child_process'
import boxen from 'boxen'
import chalk from 'chalk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function borderBox(...lines) {
  return boxen(chalk.blueBright(lines.join('\n')), {
    title: 'Demo',
    titleAlignment: 'center',
    textAlignment: 'left',
    padding: 1,
    borderStyle: 'bold',
    borderColor: 'blueBright',
  })
}

const databaseOptions = {
  name: 'database',
  prefix: '--db:',
  values: ['dev', 'local', 'prod'],
  defaultValue: 'dev',
  envFiles: {
    local: '.env.neon.local',
    dev: '.env.neon.dev',
    prod: '.env.neon.prod',
  },
}

const resendOptions = {
  name: 'resend',
  prefix: '--rs:',
  values: ['dev', 'prod'],
  defaultValue: 'dev',
  envFiles: {
    dev: '.env.resend.dev',
    prod: '.env.resend.prod',
  },
}

const cloudflareOptions = {
  name: 'cloudflare',
  prefix: '--cf:',
  values: ['local', 'dev', 'prod'],
  defaultValue: 'dev',
  envFiles: {
    local: '.env.cloudflare.local',
    dev: '.env.cloudflare.dev',
    prod: '.env.cloudflare.prod',
  },
}

const authOptions = {
  name: 'auth',
  prefix: '--auth:',
  values: ['local', 'dev', 'prod'],
  defaultValue: 'local',
  envFiles: {
    local: '.env.auth.local',
    dev: '.env.auth.dev',
    prod: '.env.auth.prod',
  },
}

const posthogOptions = {
  name: 'posthog',
  prefix: '--ph:',
  values: ['local', 'dev', 'prod'],
  defaultValue: 'local',
  envFiles: {
    local: '.env.posthog.local',
    dev: '.env.posthog.dev',
    prod: '.env.posthog.prod',
  },
}

const defaultOptions = {
  name: 'defaults',
  prefix: '--defaults:',
  values: ['all'],
  defaultValue: 'all',
  envFiles: {
    all: '.env.defaults',
  },
}

const options = [databaseOptions, resendOptions, cloudflareOptions, authOptions, posthogOptions, defaultOptions]
const PRINT_ENV_FLAG = '--print-env'
const args = process.argv.slice(2)
const printEnv = args.includes(PRINT_ENV_FLAG)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function extractEnv({ name, prefix, values, envFiles, defaultValue }, fallbackValue) {
  const value = args.find((arg) => arg.startsWith(prefix))?.substring(prefix.length)
  const env = values.includes(value) ? value : (fallbackValue ?? defaultValue)
  const file = envFiles[env]
  return { name, env, file }
}

const databaseEnv = extractEnv(databaseOptions)
const envs = options.map((option) => {
  if (option.name === 'database') {
    return databaseEnv
  }

  if (option.name === 'cloudflare') {
    return extractEnv(option, databaseEnv.env === 'local' ? 'local' : undefined)
  }

  return extractEnv(option)
})

function logEnvs(...resolvedEnvs) {
  return resolvedEnvs.map((env) => `${env.name.toUpperCase()}: ${env.env} [${env.file}]`)
}

console.info(`\n${borderBox(...logEnvs(...envs))}\n`)

const envCommand = `dotenvx run ${envs.map(({ file }) => `--env-file=${__dirname}/../.secrets/${file}`).join(' ')} -- `
const optionPrefixes = options.map((option) => option.prefix)
const runCommand = args
  .filter((arg) => arg !== PRINT_ENV_FLAG && !optionPrefixes.some((prefix) => arg.startsWith(prefix)))
  .join(' ')

if (!runCommand) {
  console.error(chalk.redBright('No command provided to run after loading environment variables'))
  process.exit(1)
}

const command = `${envCommand}${runCommand}`

if (printEnv) {
  const envOutput = execSync(`${envCommand}env`, { encoding: 'utf-8' })
  console.info(chalk.cyan('\nLoaded environment variables:\n'))
  for (const line of envOutput.trim().split('\n').sort()) {
    const [key = ''] = line.split('=', 1)
    const value = line.slice(key.length + 1)
    console.info(`  ${chalk.green(key)}=${chalk.dim(value)}`)
  }
  console.info()
}

console.info(chalk.yellow(`Running command '${command}'`))
execSync(command, { stdio: 'inherit' })
