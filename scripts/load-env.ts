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

const supabaseOptions: EnvOptions<'local' | 'dev' | 'prod'> = {
  name: 'supabase',
  prefix: '--sb:',
  values: ['dev', 'local', 'prod'] as const,
  defaultValue: 'dev' as const,
  envFiles: {
    local: '.env.supabase.local',
    dev: '.env.supabase.dev',
    prod: '.env.supabase.prod',
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

const defaultOptions: EnvOptions<'all'> = {
  name: 'defaults',
  prefix: '--defaults:',
  values: ['all'] as const,
  defaultValue: 'all' as const,
  envFiles: {
    all: '.env.defaults',
  },
}

const options: EnvOptions<string>[] = [supabaseOptions, resendOptions, defaultOptions]

type EnvAndFile<T> = {
  name: string
  env: T
  file: string
}

const args = process.argv.slice(2)

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
  .filter((arg) => !options.map((option) => option.prefix).some((prefix) => arg.startsWith(prefix)))
  .join(' ')

if (!runCommand) {
  console.error(chalk.redBright('No command provided to run after loading environment variables'))
  process.exit(1)
}

const command = `${envCommand}${runCommand}`
console.info(chalk.yellow(`Running command '${command}'`))
execSync(command, { stdio: 'inherit' })
