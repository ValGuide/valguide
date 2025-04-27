import { execSync } from 'child_process'
import { borderBox } from './border-box'
import chalk from 'chalk'

type EnvOptions<T extends string> = {
  name: string
  prefix: string
  values: readonly T[]
  defaultValue: T
  envFiles: Record<T, string>
}

const dbOptions: EnvOptions<'local' | 'dev' | 'prod'> = {
  name: 'db',
  prefix: '--db:',
  values: ['dev', 'prod'] as const,
  defaultValue: 'dev' as const,
  envFiles: {
    local: '.env.db.local',
    dev: '.env.db.dev',
    prod: '.env.db.prod',
  },
}

const webOptions: EnvOptions<'local' | 'prod'> = {
  name: 'api',
  prefix: '--api:',
  values: ['local', 'prod'] as const,
  defaultValue: 'local' as const,
  envFiles: {
    local: '.env.web.local',
    prod: '.env.web.prod',
  },
}

const defaulOptions: EnvOptions<'all'> = {
  name: 'openai',
  prefix: '--defaults:',
  values: ['all'] as const,
  defaultValue: 'all' as const,
  envFiles: {
    all: '.env.defaults',
  },
}

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

const dbEnv = extractEnv(dbOptions)
const apiEnv = extractEnv(webOptions)
const defaultEnv = extractEnv(defaulOptions)
const envs = [dbEnv, apiEnv, defaultEnv]

const logEnvs = (...envs: EnvAndFile<any>[]): string[] =>
  envs.map((env) => `${env.name.toUpperCase()}: ${env.env} [${env.file}]`)
console.info(`\n${borderBox(...logEnvs(...envs))}\n`)

const envCommand = `dotenvx run ${envs.map(({ file }) => `--env-file=${__dirname}/../.secrets/${file}`).join(' ')} -- `
const runCommand = args
  .filter((arg) => ![dbOptions.prefix, webOptions.prefix].some((prefix) => arg.startsWith(prefix)))
  .join(' ')

if (!runCommand) {
  console.error(chalk.redBright('No command provided to run after loading environment variables'))
  process.exit(1)
}

const command = `${envCommand}${runCommand}`
console.info(chalk.yellow(`Running command '${command}'`))
execSync(command, { stdio: 'inherit' })
