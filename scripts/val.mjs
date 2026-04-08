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
const DB_ENVIRONMENTS = ['dev', 'prod']
const SEED_ENVIRONMENTS = ['dev', 'prod']
const VERIFY_TARGETS = ['studio']
const REMOTE_DEV_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs']
const OPEN_TARGETS = ['github', 'github-actions']
const OPEN_URLS = {
  github: 'https://github.com/valguide/valguide',
  'github-actions': 'https://github.com/valguide/valguide/actions',
}

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
  val <command> [args] [-- passthrough]

Commands:
  help [command]             Show general or command-specific help
  targets                    List supported targets
  dev <target...> [--no-remote] [--no-open|-n] Start local development for one or more targets
  kill                       Stop common local dev processes
  build <target> [--analyse] Build a target
  preview <target>           Preview a target locally
  deploy <target> <env>      Deploy a target to dev or prod
  type-check [target]        Run type-checking for the repo or one target
  test [target]              Run tests for the repo or one supported target
  lint [fix]                 Run repo lint checks or apply lint fixes
  open <target>              Open a common ValGuide URL in the browser
  promote                    Merge local dev into main, push main, then switch back to dev
  db <action>                Run database action: generate | migrate | studio
  seed <env>                 Seed dev or prod data
  verify <target>            Run target verification

Examples:
  val dev studio
  val dev studio --no-remote
  val dev studio --no-open
  val dev studio -n
  val build app --analyse
  val preview storybook
  val deploy studio dev
  val type-check core
  val lint fix
  val open github
  val db migrate dev
  val verify studio -- --ticket VG-85
`

const COMMAND_HELP = {
  dev: `Usage: val dev <target...> [--no-remote] [--no-open|-n] [--worker]

Targets:
  ${DEV_TARGETS.join(', ')}

Notes:
  Remote bindings are the default for admin, app, studio, www, links, and docs.
  --no-remote switches those targets back to local bindings.
  --no-open (or -n) skips opening local dev URLs in the browser.
  --worker is supported only for storybook and starts the worker-backed dev flow.
  Multiple targets are supported for dev, for example: val dev studio admin
`,
  build: `Usage: val build <target> [--analyse]

Targets:
  ${BUILD_TARGETS.join(', ')}

Notes:
  --analyse is supported for admin, app, studio, www, links, and docs.
`,
  preview: `Usage: val preview <target>

Targets:
  ${PREVIEW_TARGETS.join(', ')}

Notes:
  storybook preview maps to the existing static serve workflow.
`,
  deploy: `Usage: val deploy <target> <dev|prod>

Targets:
  ${DEPLOY_TARGETS.join(', ')}

Notes:
  Deploy always requires an explicit environment.
`,
  'type-check': `Usage: val type-check [target]

Targets:
  ${TYPE_CHECK_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo type-check.
`,
  test: `Usage: val test [target]

Targets:
  ${TEST_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo test suite.
`,
  lint: `Usage: val lint [fix] [--fix]

Notes:
  Lint currently runs at repo scope.
  Use "fix" or "--fix" to run the existing repo lint-fix command.
`,
  kill: `Usage: val kill

Notes:
  Stops common local development processes by running:
    killall node && killall caffeinate
`,
  open: `Usage: val open <target>

Targets:
  ${OPEN_TARGETS.join(', ')}
`,
  promote: `Usage: val promote

Notes:
  Promotes local dev to main by running:
    1. git switch main
    2. git merge dev
    3. git push origin main
    4. git switch dev

  The command requires a clean git worktree and stops on merge or push failures.
`,
  db: `Usage:
  val db generate
  val db migrate <dev|prod>
  val db studio

Notes:
  Use the existing migration-based workflow. Do not use db:push.
`,
  seed: `Usage: val seed <dev|prod>`,
  verify: `Usage: val verify studio [-- passthrough]

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
  return value.startsWith('-')
}

function normalizeFlags(flags) {
  return flags.map((flag) => {
    if (flag === '-n') {
      return '--no-open'
    }

    return flag
  })
}

function fail(message) {
  console.error(`val: ${message}`)
  process.exit(1)
}

function quotedList(values) {
  return values.map((value) => `"${value}"`).join(', ')
}

function failWithUsage(message, command) {
  const help = COMMAND_HELP[command]
  if (!help) {
    fail(message)
  }

  fail(`${message}\n\n${help}`)
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
    failWithUsage(`unexpected argument "${positionals[0]}" for "${command}"`, command)
  }
}

function ensureAllowedFlags(flags, allowedFlags, command) {
  for (const flag of flags) {
    if (!allowedFlags.includes(flag)) {
      const supportedFlags =
        allowedFlags.length > 0 ? ` Supported flags: ${quotedList(allowedFlags)}.` : ' This command does not accept flags.'
      failWithUsage(`unsupported flag "${flag}" for "${command}".${supportedFlags}`, command)
    }
  }
}

function ensureTarget(target, supportedTargets, command) {
  if (!target) {
    failWithUsage(`missing target for "${command}". Supported targets: ${quotedList(supportedTargets)}.`, command)
  }

  if (!supportedTargets.includes(target)) {
    failWithUsage(
      `unsupported target "${target}" for "${command}". Supported targets: ${quotedList(supportedTargets)}.`,
      command,
    )
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

function envLoadInvocation(environmentFlags, commandArgs, passthrough = []) {
  return {
    command: 'pnpm',
    args: ['env:load', ...environmentFlags, ...commandArgs, ...passthrough],
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
    case 'kill':
      return createKillInvocation(positionals, flags, passthrough)
    case 'open':
      return createOpenInvocation(positionals, flags, passthrough)
    case 'promote':
      return createPromoteInvocation(positionals, flags, passthrough)
    case 'db':
      return createDbInvocation(positionals, flags, passthrough)
    case 'seed':
      return createSeedInvocation(positionals, flags, passthrough)
    case 'verify':
      return createVerifyInvocation(positionals, flags, passthrough)
    default:
      fail(`unknown command "${command}". Run "val help" to see the available commands.`)
  }
}

function createDevInvocation(positionals, flags, passthrough) {
  const normalizedFlags = normalizeFlags(flags)
  ensureAllowedFlags(normalizedFlags, ['--remote', '--no-remote', '--no-open', '--worker'], 'dev')
  if (positionals.length === 0) {
    failWithUsage(`missing target for "dev". Supported targets: ${quotedList(DEV_TARGETS)}.`, 'dev')
  }

  const targets = uniqueValues(positionals)
  for (const target of targets) {
    ensureTarget(target, DEV_TARGETS, 'dev')
  }

  if (targets.includes('workspace') && targets.length > 1) {
    failWithUsage('"workspace" cannot be combined with other dev targets.', 'dev')
  }

  if (normalizedFlags.includes('--remote') && normalizedFlags.includes('--no-remote')) {
    failWithUsage('choose either "--remote" or "--no-remote", not both.', 'dev')
  }

  if (normalizedFlags.includes('--worker')) {
    if (targets.length !== 1 || targets[0] !== 'storybook') {
      failWithUsage('--worker is supported only for target "storybook".', 'dev')
    }
    return scriptInvocation('storybook:wrangler:dev', passthrough)
  }

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "dev".', 'dev')
  }

  if (normalizedFlags.includes('--remote')) {
    for (const target of targets) {
      if (!REMOTE_DEV_TARGETS.includes(target)) {
        failWithUsage(
          `remote dev is not supported for target "${target}". Supported remote targets: ${quotedList(REMOTE_DEV_TARGETS)}.`,
          'dev',
        )
      }
    }
  }

  const forwardedFlags = normalizedFlags.filter((flag) => flag !== '--remote')
  return commandInvocation('sh', ['scripts/dev.sh', ...forwardedFlags, ...targets])
}

function createBuildInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, ['--analyse'], 'build')
  const [target, ...rest] = positionals
  ensureTarget(target, BUILD_TARGETS, 'build')
  ensureNoExtraPositionals(rest, 'build')

  if (flags.includes('--analyse')) {
    if (!['admin', 'app', 'studio', 'www', 'links', 'docs'].includes(target)) {
      failWithUsage(
        `--analyse is not supported for target "${target}". Supported analyse targets: ${quotedList([
          'admin',
          'app',
          'studio',
          'www',
          'links',
          'docs',
        ])}.`,
        'build',
      )
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
    failWithUsage('deploy requires an explicit environment: "dev" or "prod".', 'deploy')
  }

  if (!['dev', 'prod'].includes(environment)) {
    failWithUsage(`unsupported deploy environment "${environment}". Supported environments: "dev", "prod".`, 'deploy')
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
  ensureAllowedFlags(flags, ['--fix'], 'lint')
  const [mode, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'lint')

  if (mode && mode !== 'fix') {
    failWithUsage(`unsupported lint mode "${mode}". Use "fix" or omit the mode.`, 'lint')
  }

  if (mode === 'fix' || flags.includes('--fix')) {
    return scriptInvocation('lint:fix', passthrough)
  }

  return scriptInvocation('lint', passthrough)
}

function createKillInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'kill')
  ensureNoExtraPositionals(positionals, 'kill')

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "kill".', 'kill')
  }

  return {
    command: 'sh',
    args: ['-c', 'killall node && killall caffeinate'],
  }
}

function createOpenInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'open')
  const [target, ...rest] = positionals
  ensureTarget(target, OPEN_TARGETS, 'open')
  ensureNoExtraPositionals(rest, 'open')

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "open".', 'open')
  }

  return commandInvocation('open', [OPEN_URLS[target]])
}

function createPromoteInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'promote')
  ensureNoExtraPositionals(positionals, 'promote')

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "promote".', 'promote')
  }

  return commandInvocation('sh', ['scripts/promote-dev-to-main.sh'])
}

function createDbInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'db')
  const [action, ...rest] = positionals

  if (!action) {
    failWithUsage(`missing action for "db". Supported actions: ${quotedList(DB_ACTIONS)}.`, 'db')
  }

  if (!DB_ACTIONS.includes(action)) {
    failWithUsage(`unsupported db action "${action}". Supported actions: ${quotedList(DB_ACTIONS)}.`, 'db')
  }

  if (action === 'migrate') {
    const [environment, ...remainingPositionals] = rest
    ensureNoExtraPositionals(remainingPositionals, 'db')

    if (!environment) {
      failWithUsage(
        `db migrate requires an explicit environment: ${quotedList(DB_ENVIRONMENTS)}.`,
        'db',
      )
    }

    if (!DB_ENVIRONMENTS.includes(environment)) {
      failWithUsage(
        `unsupported database environment "${environment}". Supported environments: ${quotedList(DB_ENVIRONMENTS)}.`,
        'db',
      )
    }

    return envLoadInvocation([`--db:${environment}`], ['turbo', 'run', 'db:migrate'], passthrough)
  }

  ensureNoExtraPositionals(rest, 'db')
  return scriptInvocation(`db:${action}`, passthrough)
}

function createSeedInvocation(positionals, flags, passthrough) {
  ensureAllowedFlags(flags, [], 'seed')
  const [environment, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'seed')

  if (!environment) {
    failWithUsage(`missing environment for "seed". Supported environments: ${quotedList(SEED_ENVIRONMENTS)}.`, 'seed')
  }

  if (!SEED_ENVIRONMENTS.includes(environment)) {
    failWithUsage(
      `unsupported seed environment "${environment}". Supported environments: ${quotedList(SEED_ENVIRONMENTS)}.`,
      'seed',
    )
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
