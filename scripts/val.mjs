#!/usr/bin/env node

import { spawn } from 'node:child_process'

const APP_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEV_TARGETS = [...APP_TARGETS, 'workspace']
const BUILD_TARGETS = [...APP_TARGETS, 'icons']
const PREVIEW_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEPLOY_TARGETS = [...APP_TARGETS]
const TYPE_CHECK_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook', 'core']
const TEST_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'core']
const DB_ACTIONS = ['generate', 'migrate', 'studio']
const SEED_ENVIRONMENTS = ['dev', 'prod']
const VERIFY_TARGETS = ['studio']
const REMOTE_DEV_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs']

const TARGET_PACKAGE_NAMES = {
  admin: '@valguide/admin',
  app: '@valguide/app',
  studio: '@valguide/studio',
  www: '@valguide/www',
  links: '@valguide/links',
  docs: '@valguide/docs',
  storybook: '@valguide/storybook',
  core: '@valguide/core',
}

const HELP_TEXT = `ValGuide CLI

Usage:
  pnpm val <command> [args] [-- passthrough]

Commands:
  help [command]             Show general or command-specific help
  targets                    List supported targets
  dev <target...> [--remote] Start local development for one or more targets
  build <target> [--analyse] Build a target
  preview <target>           Preview a target locally
  deploy <target> <env>      Deploy a target to dev or prod
  type-check [target]        Run type-checking for the repo or one target
  test [target]              Run tests for the repo or one supported target
  lint                       Run repo lint checks
  db <action>                Run database action: generate | migrate | studio
  seed <env>                 Seed dev or prod data
  verify <target>            Run target verification

Examples:
  pnpm val dev studio
  pnpm val dev studio --remote
  pnpm val build app --analyse
  pnpm val preview storybook
  pnpm val deploy studio dev
  pnpm val type-check core
  pnpm val db migrate
  pnpm val verify studio -- --ticket VG-85
`

const COMMAND_HELP = {
  dev: `Usage: pnpm val dev <target...> [--remote] [--worker]

Targets:
  ${DEV_TARGETS.join(', ')}

Notes:
  --remote is supported for admin, app, studio, www, links, and docs.
  --worker is supported only for storybook and starts the worker-backed dev flow.
  workspace currently supports only the default local dev mode.
  Multiple targets are supported for dev, for example: pnpm val dev studio admin --remote
`,
  build: `Usage: pnpm val build <target> [--analyse]

Targets:
  ${BUILD_TARGETS.join(', ')}

Notes:
  --analyse is supported for admin, app, studio, www, links, and docs.
`,
  preview: `Usage: pnpm val preview <target>

Targets:
  ${PREVIEW_TARGETS.join(', ')}

Notes:
  storybook preview maps to the existing static serve workflow.
`,
  deploy: `Usage: pnpm val deploy <target> <dev|prod>

Targets:
  ${DEPLOY_TARGETS.join(', ')}

Notes:
  Deploy always requires an explicit environment.
`,
  'type-check': `Usage: pnpm val type-check [target]

Targets:
  ${TYPE_CHECK_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo type-check.
`,
  test: `Usage: pnpm val test [target]

Targets:
  ${TEST_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo test suite.
`,
  lint: `Usage: pnpm val lint

Notes:
  Lint currently runs at repo scope.
`,
  db: `Usage: pnpm val db <generate|migrate|studio>

Notes:
  Use the existing migration-based workflow. Do not use db:push.
`,
  seed: `Usage: pnpm val seed <dev|prod>`,
  verify: `Usage: pnpm val verify studio [-- passthrough]

Notes:
  verify currently supports studio and forwards passthrough args to the existing verification script.
`,
}

function splitPassthrough(argv) {
  const separatorIndex = argv.indexOf('--')
  if (separatorIndex === -1) {
    return { args: argv, passthrough: [] }
  }

  return {
    args: argv.slice(0, separatorIndex),
    passthrough: argv.slice(separatorIndex + 1),
  }
}

function isFlag(value) {
  return value.startsWith('--')
}

function fail(message) {
  console.error(`val: ${message}`)
  process.exit(1)
}

function printHelp(command) {
  if (!command) {
    console.log(HELP_TEXT)
    return
  }

  const help = COMMAND_HELP[command]
  if (!help) {
    fail(`unknown command "${command}"`)
  }

  console.log(help)
}

function printTargets() {
  const sections = [
    ['dev', DEV_TARGETS],
    ['build', BUILD_TARGETS],
    ['preview', PREVIEW_TARGETS],
    ['deploy', DEPLOY_TARGETS],
    ['type-check', TYPE_CHECK_TARGETS],
    ['test', TEST_TARGETS],
    ['verify', VERIFY_TARGETS],
  ]

  console.log('Supported targets:')
  for (const [command, targets] of sections) {
    console.log(`  ${command}: ${targets.join(', ')}`)
  }
}

function ensureNoExtraPositionals(positionals, command) {
  if (positionals.length > 0) {
    fail(`unexpected argument "${positionals[0]}" for "${command}"`)
  }
}

function ensureAllowedFlags(flags, allowedFlags, command) {
  for (const flag of flags) {
    if (!allowedFlags.includes(flag)) {
      fail(`unsupported flag "${flag}" for "${command}"`)
    }
  }
}

function ensureTarget(target, supportedTargets, command) {
  if (!target) {
    fail(`missing target for "${command}"`)
  }

  if (!supportedTargets.includes(target)) {
    fail(`unsupported target "${target}" for "${command}"`)
  }
}

function uniqueValues(values) {
  return [...new Set(values)]
}

function commandInvocation(command, args = []) {
  return {
    command,
    args,
  }
}

function scriptInvocation(scriptName, passthrough = []) {
  return {
    command: 'pnpm',
    args: ['run', scriptName, ...forwardedArgs(passthrough)],
  }
}

function forwardedArgs(passthrough) {
  return passthrough.length > 0 ? ['--', ...passthrough] : []
}

function packageScriptInvocation(target, scriptName, passthrough = []) {
  const packageName = TARGET_PACKAGE_NAMES[target]
  if (!packageName) {
    fail(`no package mapping found for target "${target}"`)
  }

  return {
    command: 'pnpm',
    args: ['--filter', packageName, 'run', scriptName, ...forwardedArgs(passthrough)],
  }
}

function createInvocation(command, positionals, flags, passthrough) {
  switch (command) {
    case 'dev':
      return createDevInvocation(positionals, flags, passthrough)
    case 'build':
      return createBuildInvocation(positionals, flags, passthrough)
    case 'preview':
      return createPreviewInvocation(positionals, flags, passthrough)
    case 'deploy':
      return createDeployInvocation(positionals, flags, passthrough)
    case 'type-check':
      return createTypeCheckInvocation(positionals, flags, passthrough)
    case 'test':
      return createTestInvocation(positionals, flags, passthrough)
    case 'lint':
      return createLintInvocation(positionals, flags, passthrough)
    case 'db':
      return createDbInvocation(positionals, flags, passthrough)
    case 'seed':
      return createSeedInvocation(positionals, flags, passthrough)
    case 'verify':
      return createVerifyInvocation(positionals, flags, passthrough)
    default:
      fail(`unknown command "${command}"`)
  }
}

function createDevInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, ['--remote', '--worker'], 'dev')
  if (positionals.length === 0) {
    fail('missing target for "dev"')
  }

  const targets = uniqueValues(positionals)
  for (const target of targets) {
    ensureTarget(target, DEV_TARGETS, 'dev')
  }

  if (targets.includes('workspace') && targets.length > 1) {
    fail('"workspace" cannot be combined with other dev targets')
  }

  if (flags.includes('--worker')) {
    if (targets.length !== 1 || targets[0] !== 'storybook') {
      fail('--worker is supported only for target "storybook"')
    }
    return scriptInvocation('storybook:wrangler:dev', passthrough)
  }

  if (passthrough.length > 0) {
    fail('passthrough args are not supported for dev')
  }

  if (flags.includes('--remote')) {
    for (const target of targets) {
      if (!REMOTE_DEV_TARGETS.includes(target)) {
        fail(`--remote is not supported for target "${target}"`)
      }
    }
  }

  return commandInvocation('sh', ['scripts/dev.sh', ...flags, ...targets])
}

function createBuildInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, ['--analyse'], 'build')
  const [target, ...rest] = positionals
  ensureTarget(target, BUILD_TARGETS, 'build')
  ensureNoExtraPositionals(rest, 'build')

  if (flags.includes('--analyse')) {
    if (!['admin', 'app', 'studio', 'www', 'links', 'docs'].includes(target)) {
      fail(`--analyse is not supported for target "${target}"`)
    }
    return scriptInvocation(`${target}:build:analyse`, passthrough)
  }

  return scriptInvocation(`${target}:build`, passthrough)
}

function createPreviewInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'preview')
  const [target, ...rest] = positionals
  ensureTarget(target, PREVIEW_TARGETS, 'preview')
  ensureNoExtraPositionals(rest, 'preview')

  if (target === 'storybook') {
    return scriptInvocation('storybook:serve', passthrough)
  }

  return scriptInvocation(`${target}:preview`, passthrough)
}

function createDeployInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'deploy')
  const [target, environment, ...rest] = positionals
  ensureTarget(target, DEPLOY_TARGETS, 'deploy')
  ensureNoExtraPositionals(rest, 'deploy')

  if (!environment) {
    fail('deploy requires an explicit environment: dev or prod')
  }

  if (!['dev', 'prod'].includes(environment)) {
    fail(`unsupported deploy environment "${environment}"`)
  }

  if (environment === 'prod') {
    return scriptInvocation(`${target}:deploy`, passthrough)
  }

  return scriptInvocation(`${target}:deploy:dev`, passthrough)
}

function createTypeCheckInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'type-check')
  const [target, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'type-check')

  if (!target) {
    return scriptInvocation('type-check', passthrough)
  }

  ensureTarget(target, TYPE_CHECK_TARGETS, 'type-check')

  if (target === 'core') {
    return scriptInvocation('core:type-check', passthrough)
  }

  if (target === 'storybook') {
    return packageScriptInvocation('storybook', 'type-check', passthrough)
  }

  return scriptInvocation(`${target}:type-check`, passthrough)
}

function createTestInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'test')
  const [target, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'test')

  if (!target) {
    return scriptInvocation('test', passthrough)
  }

  ensureTarget(target, TEST_TARGETS, 'test')
  return packageScriptInvocation(target, 'test', passthrough)
}

function createLintInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'lint')
  ensureNoExtraPositionals(positionals, 'lint')
  return scriptInvocation('lint', passthrough)
}

function createDbInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'db')
  const [action, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'db')

  if (!action) {
    fail(`missing action for "db"; supported actions: ${DB_ACTIONS.join(', ')}`)
  }

  if (!DB_ACTIONS.includes(action)) {
    fail(`unsupported db action "${action}"`)
  }

  return scriptInvocation(`db:${action}`, passthrough)
}

function createSeedInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'seed')
  const [environment, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'seed')

  if (!environment) {
    fail(`missing environment for "seed"; supported environments: ${SEED_ENVIRONMENTS.join(', ')}`)
  }

  if (!SEED_ENVIRONMENTS.includes(environment)) {
    fail(`unsupported seed environment "${environment}"`)
  }

  return scriptInvocation(`seed:${environment}`, passthrough)
}

function createVerifyInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'verify')
  const [target, ...rest] = positionals
  ensureTarget(target, VERIFY_TARGETS, 'verify')
  ensureNoExtraPositionals(rest, 'verify')

  return scriptInvocation('studio:agent:verify', passthrough)
}

function runInvocation(invocation) {
  const commandLine = invocation.shell ? invocation.command : [invocation.command, ...invocation.args].join(' ')
  console.log(`> ${commandLine}`)

  const child = spawn(invocation.command, invocation.args, {
    stdio: 'inherit',
    shell: invocation.shell ?? false,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 1)
  })
}

function main() {
  const { args, passthrough } = splitPassthrough(process.argv.slice(2))

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp()
    return
  }

  const [command, ...rest] = args

  if (command === 'help') {
    printHelp(rest[0])
    return
  }

  if (command === 'targets') {
    printTargets()
    return
  }

  const flags = rest.filter(isFlag)
  const positionals = rest.filter((value) => !isFlag(value))
  const invocation = createInvocation(command, positionals, flags, passthrough)
  runInvocation(invocation)
}

main()
