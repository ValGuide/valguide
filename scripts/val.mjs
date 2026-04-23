#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const APP_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEV_TARGETS = [...APP_TARGETS]
const BUILD_TARGETS = [...APP_TARGETS, 'icons']
const PREVIEW_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEPLOY_TARGETS = [...APP_TARGETS]
const TYPE_CHECK_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook', 'core']
const TEST_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'core']
const DB_ACTIONS = ['generate', 'migrate', 'studio', 'setup', 'status']
const DB_ENVIRONMENTS = ['local', 'dev', 'prod']
const COMPLETION_SHELLS = ['zsh']
const REMOTE_DEV_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs']
const OPEN_TARGET_ALIASES = {
  github: 'github',
  gh: 'github',
  'github-actions': 'github-actions',
  'github actions': 'github-actions',
  'gh-actions': 'github-actions',
  'gh actions': 'github-actions',
}
const OPEN_TARGET_DISPLAY = ['github', 'gh', 'github actions', 'gh actions']
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
  completion <shell>         Print shell completion script
  completion install <shell> Install shell completion script
  dev <target...> [--no-remote] [--no-open|-n] [--db:<env>] [--offline] Start local development for one or more targets
  kill                       Stop common local dev processes
  build <target> [--analyse] Build a target
  preview <target> [--db:<env>] [--offline] Preview a target locally
  deploy <target> <env>      Deploy a target to dev or prod
  type-check [target]        Run type-checking for the repo or one target
  test [target]              Run tests for the repo or one supported target
  lint [fix]                 Run repo lint checks or apply lint fixes
  open <target>              Open a common ValGuide URL in the browser
  promote                    Merge local dev into main, push main, then switch back to dev
  db <action>                Run database action: generate | migrate | studio | setup local | status local

Examples:
  val dev studio
  val dev studio --no-remote
  val dev studio --offline
  val dev studio --no-open
  val dev studio --db:prod
  val dev studio -n
  val build app --analyse
  val preview storybook
  val preview studio --db:prod
  eval "$(val completion zsh)"
  val completion install zsh
  val deploy studio dev
  val type-check core
  val lint fix
  val open github
  val open gh
  val open github actions
  val open gh actions
  val db setup local
  val db status local
  val db migrate dev
`

const COMMAND_HELP = {
  dev: `Usage: val dev <target...> [--no-remote] [--no-open|-n] [--db:<local|dev|prod>] [--offline] [--worker]

Targets:
  ${DEV_TARGETS.join(', ')}

Notes:
  Remote bindings are the default for admin, app, studio, www, links, and docs.
  --no-remote switches those targets back to local bindings.
  --no-open (or -n) skips opening local dev URLs in the browser.
  --db:<local|dev|prod> is forwarded as VALGUIDE_DB_ENV for external env management. The default is --db:dev.
  --offline is shorthand for --db:local --no-remote.
  --worker is supported only for storybook and starts the worker-backed dev flow.
  Multiple targets are supported for dev, for example: val dev studio admin
`,
  completion: `Usage:
  val completion <zsh>
  val completion install <zsh>

Supported shells:
  ${COMPLETION_SHELLS.join(', ')}

Examples:
  eval "$(val completion zsh)"
  val completion zsh > ~/.zsh/completions/_val
  val completion install zsh
`,
  build: `Usage: val build <target> [--analyse]

Targets:
  ${BUILD_TARGETS.join(', ')}

Notes:
  --analyse is supported for admin, app, studio, www, links, and docs.
`,
  preview: `Usage: val preview <target> [--db:<local|dev|prod>] [--offline]

Targets:
  ${PREVIEW_TARGETS.join(', ')}

Notes:
  --db:<local|dev|prod> is forwarded as VALGUIDE_DB_ENV for external env management. The default is --db:dev.
  --offline is shorthand for --db:local.
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
  ${OPEN_TARGET_DISPLAY.join(', ')}
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
  val db setup local
  val db status local
  val db migrate <local|dev|prod>
  val db studio

Notes:
  Use the existing migration-based workflow. Do not use db:push.
  setup local bootstraps Homebrew PostgreSQL on macOS, provisions the local role/database, and runs local migrations.
  status local checks whether the local PostgreSQL instance at DATABASE_URL (or the built-in local default) is reachable.
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

function ensureCompletionShell(shell) {
  if (!shell) {
    failWithUsage(`missing shell for "completion". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
  }

  if (!COMPLETION_SHELLS.includes(shell)) {
    failWithUsage(`unsupported shell "${shell}". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
  }
}

function getCompletionScript(shell) {
  ensureCompletionShell(shell)

  if (shell === 'zsh') {
    return zshCompletionScript()
  }

  failWithUsage(`unsupported shell "${shell}". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
}

async function installCompletion(shell) {
  const script = getCompletionScript(shell)

  if (shell === 'zsh') {
    const completionDirectory = join(homedir(), '.zsh', 'completions')
    const completionFile = join(completionDirectory, '_val')

    await mkdir(completionDirectory, { recursive: true })
    await writeFile(completionFile, `${script}\n`)

    console.log(`Installed zsh completion to ${completionFile}`)
    console.log('Add this to ~/.zshrc if it is not already present:')
    console.log('  fpath=(~/.zsh/completions $fpath)')
    console.log('  autoload -Uz compinit')
    console.log('  compinit')
    return
  }

  failWithUsage(`unsupported shell "${shell}". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
}

async function handleCompletion(args) {
  const [actionOrShell, maybeShell, ...extraArgs] = args

  if (actionOrShell === 'install') {
    ensureNoExtraPositionals(extraArgs, 'completion')
    await installCompletion(maybeShell)
    return
  }

  ensureNoExtraPositionals([maybeShell, ...extraArgs].filter(Boolean), 'completion')
  console.log(getCompletionScript(actionOrShell))
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
  ]

  console.log('Supported targets:')
  for (const [command, targets] of sections) {
    console.log(`  ${command}: ${targets.join(', ')}`)
  }
}

function shellWords(values) {
  return values.map((value) => `'${value.replaceAll("'", "'\\''")}'`).join(' ')
}

function zshCompletionScript() {
  const commands = [
    'help:Show general or command-specific help',
    'targets:List supported targets',
    'completion:Print shell completion script',
    'dev:Start local development',
    'kill:Stop common local dev processes',
    'build:Build a target',
    'preview:Preview a target locally',
    'deploy:Deploy a target',
    'type-check:Run type-checking',
    'test:Run tests',
    'lint:Run lint checks',
    'open:Open a common ValGuide URL',
    'promote:Promote local dev into main',
    'db:Run a database action',
  ]

  return `#compdef val

local context state line
typeset -A opt_args
local -a commands

commands=(${shellWords(commands)})

_arguments -C \
  '1:command:->command' \
  '*::args:'

case $state in
  command)
    _describe -t commands 'val command' commands
    ;;
esac
`
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
        allowedFlags.length > 0
          ? ` Supported flags: ${quotedList(allowedFlags)}.`
          : ' This command does not accept flags.'
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

function extractEnvironmentFlag(flags, prefix, values, fallback, command) {
  const matchingFlags = flags.filter((flag) => flag.startsWith(prefix))
  if (matchingFlags.length === 0) {
    return { selectedValue: fallback, remainingFlags: flags }
  }

  if (matchingFlags.length > 1) {
    failWithUsage(`choose only one ${prefix}<value> flag for "${command}".`, command)
  }

  const selectedFlag = matchingFlags[0]
  const selectedValue = selectedFlag.slice(prefix.length)
  if (!values.includes(selectedValue)) {
    failWithUsage(
      `unsupported value "${selectedValue}" for "${prefix}". Supported values: ${quotedList(values)}.`,
      command,
    )
  }

  return {
    selectedValue,
    remainingFlags: flags.filter((flag) => flag !== selectedFlag),
  }
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
    case 'completion':
      return fail(
        'the "completion" command does not run a child process and should be handled before invocation creation',
      )
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
    default:
      fail(`unknown command "${command}". Run "val help" to see the available commands.`)
  }
}

function createDevInvocation(positionals, flags, passthrough) {
  const normalizedFlags = normalizeFlags(flags)
  const { selectedValue: databaseEnvironment, remainingFlags: devFlags } = extractEnvironmentFlag(
    normalizedFlags,
    '--db:',
    ['local', 'dev', 'prod'],
    'dev',
    'dev',
  )
  ensureAllowedFlags(devFlags, ['--remote', '--no-remote', '--no-open', '--offline', '--worker'], 'dev')
  if (positionals.length === 0) {
    failWithUsage(`missing target for "dev". Supported targets: ${quotedList(DEV_TARGETS)}.`, 'dev')
  }

  const targets = uniqueValues(positionals)
  for (const target of targets) {
    ensureTarget(target, DEV_TARGETS, 'dev')
  }

  if (devFlags.includes('--offline')) {
    if (databaseEnvironment !== 'dev') {
      failWithUsage('--offline cannot be combined with an explicit --db:<env> flag.', 'dev')
    }

    if (devFlags.includes('--remote')) {
      failWithUsage('--offline cannot be combined with --remote.', 'dev')
    }
  }

  if (devFlags.includes('--remote') && devFlags.includes('--no-remote')) {
    failWithUsage('choose either "--remote" or "--no-remote", not both.', 'dev')
  }

  if (devFlags.includes('--worker')) {
    if (targets.length !== 1 || targets[0] !== 'storybook') {
      failWithUsage('--worker is supported only for target "storybook".', 'dev')
    }
    return scriptInvocation('storybook:wrangler:dev', passthrough)
  }

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "dev".', 'dev')
  }

  if (devFlags.includes('--remote')) {
    for (const target of targets) {
      if (!REMOTE_DEV_TARGETS.includes(target)) {
        failWithUsage(
          `remote dev is not supported for target "${target}". Supported remote targets: ${quotedList(REMOTE_DEV_TARGETS)}.`,
          'dev',
        )
      }
    }
  }

  const offlineMode = devFlags.includes('--offline')
  const forwardedFlags = devFlags.filter((flag) => flag !== '--remote' && flag !== '--offline')
  return commandInvocation('sh', [
    'scripts/dev.sh',
    `--db:${offlineMode ? 'local' : databaseEnvironment}`,
    ...(offlineMode ? ['--no-remote'] : []),
    ...forwardedFlags,
    ...targets,
  ])
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
  const { selectedValue: databaseEnvironment, remainingFlags: previewFlags } = extractEnvironmentFlag(
    flags,
    '--db:',
    ['local', 'dev', 'prod'],
    'dev',
    'preview',
  )
  ensureAllowedFlags(previewFlags, ['--offline'], 'preview')
  const [target, ...rest] = positionals
  ensureTarget(target, PREVIEW_TARGETS, 'preview')
  ensureNoExtraPositionals(rest, 'preview')

  if (target === 'storybook') {
    return scriptInvocation('storybook:serve', passthrough)
  }

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "preview".', 'preview')
  }

  const offlineMode = previewFlags.includes('--offline')
  if (offlineMode && databaseEnvironment !== 'dev') {
    failWithUsage('--offline cannot be combined with an explicit --db:<env> flag.', 'preview')
  }

  return commandInvocation('sh', ['scripts/preview.sh', `--db:${offlineMode ? 'local' : databaseEnvironment}`, target])
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
  const target = positionals.join(' ')
  const normalizedTarget = OPEN_TARGET_ALIASES[target]

  if (!normalizedTarget) {
    if (positionals.length === 0) {
      failWithUsage(`missing target for "open". Supported targets: ${quotedList(OPEN_TARGET_DISPLAY)}.`, 'open')
    }

    failWithUsage(
      `unsupported target "${target}" for "open". Supported targets: ${quotedList(OPEN_TARGET_DISPLAY)}.`,
      'open',
    )
  }

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "open".', 'open')
  }

  return commandInvocation('open', [OPEN_URLS[normalizedTarget]])
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
  const [action, subaction, ...rest] = positionals

  if (!action) {
    failWithUsage(`missing action for "db". Supported actions: ${quotedList(DB_ACTIONS)}.`, 'db')
  }

  if (!DB_ACTIONS.includes(action)) {
    failWithUsage(`unsupported db action "${action}". Supported actions: ${quotedList(DB_ACTIONS)}.`, 'db')
  }

  if (action === 'setup' || action === 'status') {
    if (subaction !== 'local') {
      failWithUsage(`db ${action} requires subaction "local".`, 'db')
    }

    ensureNoExtraPositionals(rest, 'db')
    return scriptInvocation(`db:${action}-local`, passthrough)
  }

  if (action === 'migrate') {
    const [environment, ...remainingPositionals] = [subaction, ...rest]
    ensureNoExtraPositionals(remainingPositionals, 'db')

    if (!environment) {
      failWithUsage(`db migrate requires an explicit environment: ${quotedList(DB_ENVIRONMENTS)}.`, 'db')
    }

    if (!DB_ENVIRONMENTS.includes(environment)) {
      failWithUsage(
        `unsupported database environment "${environment}". Supported environments: ${quotedList(DB_ENVIRONMENTS)}.`,
        'db',
      )
    }

    return scriptInvocation('db:migrate', passthrough)
  }

  if (subaction) {
    failWithUsage(`unexpected argument "${subaction}" for "db".`, 'db')
  }

  return scriptInvocation(`db:${action}`, passthrough)
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

async function main() {
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

  if (command === 'completion') {
    await handleCompletion(rest)
    return
  }

  const flags = rest.filter(isFlag)
  const positionals = rest.filter((value) => !isFlag(value))
  const invocation = createInvocation(command, positionals, flags, passthrough)
  runInvocation(invocation)
}

await main()
