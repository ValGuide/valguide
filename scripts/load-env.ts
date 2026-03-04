import { execSync } from 'node:child_process'
import chalk from 'chalk'
import { borderBox } from './border-box'

type EnvOptions<T extends string> = {
  name: string
  prefix: string
  values: readonly T[]
  defaultValue: T
  envFiles: Record<T, string>
}

const databaseOptions: EnvOptions<'local' | 'dev' | 'prod'> = {
  name: 'database',
  prefix: '--db:',
  values: ['dev', 'local', 'prod'] as const,
  defaultValue: 'dev' as const,
  envFiles: {
    local: '.env.neon.local',
    dev: '.env.neon.dev',
    prod: '.env.neon.prod',
  },
}

const resendOptions: EnvOptions<'dev' | 'prod'> = {
  name: 'resend',
  prefix: '--rs:',
  values: ['dev', 'prod'] as const,
  defaultValue: 'dev' as const,
  envFiles: {
    dev: '.env.resend.dev',
    prod: '.env.resend.prod',
  },
}

const cloudflareOptions: EnvOptions<'dev' | 'prod'> = {
  name: 'cloudflare',
  prefix: '--cf:',
  values: ['dev', 'prod'] as const,
  defaultValue: 'dev' as const,
  envFiles: {
    dev: '.env.cloudflare.dev',
    prod: '.env.cloudflare.prod',
  },
}

const authOptions: EnvOptions<'local' | 'dev' | 'prod'> = {
  name: 'auth',
  prefix: '--auth:',
  values: ['local', 'dev', 'prod'] as const,
  defaultValue: 'local' as const,
  envFiles: {
    local: '.env.auth.local',
    dev: '.env.auth.dev',
    prod: '.env.auth.prod',
  },
}

const posthogOptions: EnvOptions<'local' | 'dev' | 'prod'> = {
  name: 'posthog',
  prefix: '--ph:',
  values: ['local', 'dev', 'prod'] as const,
  defaultValue: 'local' as const,
  envFiles: {
    local: '.env.posthog.local',
    dev: '.env.posthog.dev',
    prod: '.env.posthog.prod',
  },
}

const defaultOptions: EnvOptions<'all'> = {
  name: 'defaults',
  prefix: '--defaults:',
  values: ['all'] as const,
  defaultValue: 'all' as const,
  envFiles: {
    all: '.env.defaults',
  },
}

const options: EnvOptions<string>[] = [
  databaseOptions,
  resendOptions,
  cloudflareOptions,
  authOptions,
  posthogOptions,
  defaultOptions,
]

type EnvAndFile<T> = {
  name: string
  env: T
  file: string
}

const PRINT_ENV_FLAG = '--print-env'
const args = process.argv.slice(2)
const printEnv = args.includes(PRINT_ENV_FLAG)

const extractEnv = <T extends string>({
  name,
  prefix,
  values,
  envFiles,
  defaultValue,
}: EnvOptions<T>): EnvAndFile<T> => {
  const value = args.find((arg) => arg.startsWith(prefix))?.substring(prefix.length)
  const env = values.includes(value as T) ? (value as T) : defaultValue
  const file = envFiles[env]
  return { name, env, file }
}

const envs = options.map((option) => extractEnv(option))

const logEnvs = (...envs: EnvAndFile<string>[]): string[] =>
  envs.map((env) => `${env.name.toUpperCase()}: ${env.env} [${env.file}]`)
console.info(`\n${borderBox(...logEnvs(...envs))}\n`)

const envCommand = `dotenvx run ${envs.map(({ file }) => `--env-file=${__dirname}/../.secrets/${file}`).join(' ')} -- `
const runCommand = args
  .filter(
    (arg) => arg !== PRINT_ENV_FLAG && !options.map((option) => option.prefix).some((prefix) => arg.startsWith(prefix)),
  )
  .join(' ')

if (!runCommand) {
  console.error(chalk.redBright('No command provided to run after loading environment variables'))
  process.exit(1)
}

const command = `${envCommand}${runCommand}`

if (printEnv) {
  const envOutput = execSync(`${envCommand}env`, { encoding: 'utf-8' })
  console.info(chalk.cyan('\n📋 Loaded environment variables:\n'))
  for (const line of envOutput.trim().split('\n').sort()) {
    const [key = ''] = line.split('=', 1)
    const value = line.slice(key.length + 1)
    console.info(`  ${chalk.green(key)}=${chalk.dim(value)}`)
  }
  console.info()
}

console.info(chalk.yellow(`Running command '${command}'`))
execSync(command, { stdio: 'inherit' })
