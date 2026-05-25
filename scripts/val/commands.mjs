import {
  commandInvocation,
  ensureAllowedFlags,
  ensureNoExtraPositionals,
  ensureTarget,
  extractEnvironmentFlag,
  forwardedArgs,
  normalizeFlags,
  quotedList,
  uniqueValues,
} from './helpers.mjs'

const APP_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEV_TARGETS = [...APP_TARGETS]
const BUILD_TARGETS = [...APP_TARGETS, 'icons']
const PREVIEW_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook']
const DEPLOY_TARGETS = [...APP_TARGETS]
const TYPE_CHECK_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'docs', 'storybook', 'core']
const TEST_TARGETS = ['admin', 'app', 'studio', 'www', 'links', 'core']
const DB_ACTIONS = ['generate', 'migrate', 'studio', 'setup', 'status']
const DB_ENVIRONMENTS = ['local', 'dev', 'prod']
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

export function registerValGuideCommands(cli) {
  cli.registerCommands(commands())

  for (const target of DEV_TARGETS) {
    cli.registerShortcut(target, 'dev', [target])
  }

  cli.registerTargetSection('dev', DEV_TARGETS)
  cli.registerTargetSection('build', BUILD_TARGETS)
  cli.registerTargetSection('preview', PREVIEW_TARGETS)
  cli.registerTargetSection('deploy', DEPLOY_TARGETS)
  cli.registerTargetSection('type-check', TYPE_CHECK_TARGETS)
  cli.registerTargetSection('test', TEST_TARGETS)

  cli.addExamples([
    'val studio',
    'val dev studio',
    'val dev studio --no-remote',
    'val dev studio --offline',
    'val dev studio --no-open',
    'val dev --all --no-open',
    'val dev studio --db:prod',
    'val dev studio -n',
    'val build app --analyse',
    'val preview storybook',
    'val preview studio --db:prod',
    'eval "$(val completion zsh)"',
    'val completion install zsh',
    'val deploy studio dev',
    'val type-check core',
    'val lint fix',
    'val open github',
    'val open gh',
    'val open github actions',
    'val open gh actions',
    'val db setup local',
    'val db status local',
    'val db migrate dev',
  ])
}

function commands() {
  return [
    {
      name: 'dev',
      usage: 'dev <target...>',
      summary: 'Start local development for one or more targets',
      help: `Usage: val dev <target...> [--remote|--no-remote] [--no-open|-n] [--db:<local|dev|prod>] [--offline] [--worker]
       val dev --all [--no-open|-n] [--db:<local|dev|prod>] [--offline]
       val dev --list

Targets:
  ${DEV_TARGETS.join(', ')}

Notes:
  Local bindings and the local database are the default for all dev targets.
  Any dev target can be used as a top-level shorthand, for example: val studio == val dev studio
  --remote switches supported targets to Cloudflare remote bindings and defaults the database to dev. It requires real Cloudflare binding IDs in Wrangler config.
  --no-remote keeps local bindings when combined with an explicit --db:<env>.
  --no-open (or -n) skips opening local dev URLs in the browser.
  --db:<local|dev|prod> is forwarded as VALGUIDE_DB_ENV for external env management. The default is --db:local.
  --offline is shorthand for --db:local --no-remote.
  --worker is supported only for storybook and starts the worker-backed dev flow.
  --all starts all dev targets.
  --list shows the available dev targets and URLs.
  Anonymous CLI telemetry records the target count and mode unless disabled with val telemetry disable or VALGUIDE_TELEMETRY_DISABLED=1.
  Multiple targets are supported for dev, for example: val dev studio admin
`,
      createInvocation: createDevInvocation,
    },
    {
      name: 'kill',
      usage: 'kill',
      summary: 'Stop common local dev processes',
      help: `Usage: val kill

Notes:
  Stops common local development processes by running:
    killall node && killall caffeinate
`,
      createInvocation: createKillInvocation,
    },
    {
      name: 'build',
      usage: 'build <target>',
      summary: 'Build a target',
      help: `Usage: val build <target> [--analyse]

Targets:
  ${BUILD_TARGETS.join(', ')}

Notes:
  --analyse is supported for admin, app, studio, www, links, and docs.
`,
      createInvocation: createBuildInvocation,
    },
    {
      name: 'preview',
      usage: 'preview <target>',
      summary: 'Preview a target locally',
      help: `Usage: val preview <target> [--db:<local|dev|prod>] [--offline]

Targets:
  ${PREVIEW_TARGETS.join(', ')}

Notes:
  --db:<local|dev|prod> is forwarded as VALGUIDE_DB_ENV for external env management. The default is --db:dev.
  --offline is shorthand for --db:local.
  storybook preview maps to the existing static serve workflow.
`,
      createInvocation: createPreviewInvocation,
    },
    {
      name: 'deploy',
      usage: 'deploy <target> <env>',
      summary: 'Deploy a target to dev or prod',
      help: `Usage: val deploy <target> <dev|prod>

Targets:
  ${DEPLOY_TARGETS.join(', ')}

Notes:
  Deploy always requires an explicit environment.
`,
      createInvocation: createDeployInvocation,
    },
    {
      name: 'type-check',
      usage: 'type-check [target]',
      summary: 'Run type-checking for the repo or one target',
      help: `Usage: val type-check [target]

Targets:
  ${TYPE_CHECK_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo type-check.
`,
      createInvocation: createTypeCheckInvocation,
    },
    {
      name: 'test',
      usage: 'test [target]',
      summary: 'Run tests for the repo or one supported target',
      help: `Usage: val test [target]

Targets:
  ${TEST_TARGETS.join(', ')}

Notes:
  Omit the target to run the full repo test suite.
`,
      createInvocation: createTestInvocation,
    },
    {
      name: 'lint',
      usage: 'lint [fix]',
      summary: 'Run repo lint checks or apply lint fixes',
      help: `Usage: val lint [fix] [--fix]

Notes:
  Lint currently runs at repo scope.
  Use "fix" or "--fix" to run the existing repo lint-fix command.
`,
      createInvocation: createLintInvocation,
    },
    {
      name: 'open',
      usage: 'open <target>',
      summary: 'Open a common ValGuide URL in the browser',
      help: `Usage: val open <target>

Targets:
  ${OPEN_TARGET_DISPLAY.join(', ')}
`,
      createInvocation: createOpenInvocation,
    },
    {
      name: 'promote',
      usage: 'promote',
      summary: 'Merge local dev into main, push main, then switch back to dev',
      help: `Usage: val promote

Notes:
  Promotes local dev to main by running:
    1. git switch main
    2. git merge dev
    3. git push origin main
    4. git switch dev

  The command requires a clean git worktree and stops on merge or push failures.
`,
      createInvocation: createPromoteInvocation,
    },
    {
      name: 'db',
      usage: 'db <action>',
      summary: 'Run database action: generate | migrate | studio | setup local | status local',
      help: `Usage:
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
      createInvocation: createDbInvocation,
    },
  ]
}

function scriptInvocation(scriptName, passthrough = []) {
  return {
    command: 'pnpm',
    args: ['run', scriptName, ...forwardedArgs(passthrough)],
  }
}

function packageScriptInvocation(target, scriptName, passthrough = []) {
  const packageName = TARGET_PACKAGE_NAMES[target]
  if (!packageName) {
    throw new Error(`no package mapping found for target "${target}"`)
  }

  return {
    command: 'pnpm',
    args: ['--filter', packageName, 'run', scriptName, ...forwardedArgs(passthrough)],
  }
}

function createDevInvocation({ positionals, flags, passthrough, failWithUsage }) {
  const normalizedFlags = normalizeFlags(flags)
  const hasExplicitDatabaseEnvironment = normalizedFlags.some((flag) => flag.startsWith('--db:'))
  const { selectedValue: databaseEnvironment, remainingFlags: devFlags } = extractEnvironmentFlag(
    normalizedFlags,
    '--db:',
    ['local', 'dev', 'prod'],
    'local',
    'dev',
    failWithUsage,
  )
  ensureAllowedFlags(
    devFlags,
    ['--remote', '--no-remote', '--no-open', '--offline', '--worker', '--all', '--list'],
    'dev',
    failWithUsage,
  )

  if (devFlags.includes('--list')) {
    if (positionals.length > 0) {
      failWithUsage('dev --list does not accept target arguments.', 'dev')
    }

    if (devFlags.length > 1) {
      failWithUsage('dev --list cannot be combined with other dev flags.', 'dev')
    }

    return commandInvocation('sh', ['scripts/dev.sh', '--list'])
  }

  const allMode = devFlags.includes('--all')
  if (allMode && positionals.length > 0) {
    failWithUsage('dev --all does not accept target arguments.', 'dev')
  }

  if (!allMode && positionals.length === 0) {
    failWithUsage(`missing target for "dev". Supported targets: ${quotedList(DEV_TARGETS)}.`, 'dev')
  }

  const targets = allMode ? DEV_TARGETS : uniqueValues(positionals)
  for (const target of targets) {
    ensureTarget(target, DEV_TARGETS, 'dev', failWithUsage)
  }

  if (devFlags.includes('--offline')) {
    if (hasExplicitDatabaseEnvironment) {
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
  const remoteMode = devFlags.includes('--remote')
  const selectedDatabaseEnvironment = remoteMode && !hasExplicitDatabaseEnvironment ? 'dev' : databaseEnvironment
  const forwardedFlags = devFlags.filter((flag) => flag !== '--all' && flag !== '--offline')
  return commandInvocation(
    'sh',
    [
      'scripts/dev.sh',
      `--db:${offlineMode ? 'local' : selectedDatabaseEnvironment}`,
      ...(offlineMode ? ['--no-remote'] : []),
      ...forwardedFlags,
      ...targets,
    ],
    {
      telemetry: {
        event: 'val.dev.started',
        properties: {
          target_count: targets.length,
          all_mode: allMode,
          remote_mode: remoteMode,
          offline_mode: offlineMode,
          database_environment: offlineMode ? 'local' : selectedDatabaseEnvironment,
        },
      },
    },
  )
}

function createBuildInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, ['--analyse'], 'build', failWithUsage)
  const [target, ...rest] = positionals
  ensureTarget(target, BUILD_TARGETS, 'build', failWithUsage)
  ensureNoExtraPositionals(rest, 'build', failWithUsage)

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

function createPreviewInvocation({ positionals, flags, passthrough, failWithUsage }) {
  const hasExplicitDatabaseEnvironment = flags.some((flag) => flag.startsWith('--db:'))
  const { selectedValue: databaseEnvironment, remainingFlags: previewFlags } = extractEnvironmentFlag(
    flags,
    '--db:',
    ['local', 'dev', 'prod'],
    'dev',
    'preview',
    failWithUsage,
  )
  ensureAllowedFlags(previewFlags, ['--offline'], 'preview', failWithUsage)
  const [target, ...rest] = positionals
  ensureTarget(target, PREVIEW_TARGETS, 'preview', failWithUsage)
  ensureNoExtraPositionals(rest, 'preview', failWithUsage)

  if (target === 'storybook') {
    return scriptInvocation('storybook:serve', passthrough)
  }

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "preview".', 'preview')
  }

  const offlineMode = previewFlags.includes('--offline')
  if (offlineMode && hasExplicitDatabaseEnvironment) {
    failWithUsage('--offline cannot be combined with an explicit --db:<env> flag.', 'preview')
  }

  return commandInvocation('sh', ['scripts/preview.sh', `--db:${offlineMode ? 'local' : databaseEnvironment}`, target])
}

function createDeployInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'deploy', failWithUsage)
  const [target, environment, ...rest] = positionals
  ensureTarget(target, DEPLOY_TARGETS, 'deploy', failWithUsage)
  ensureNoExtraPositionals(rest, 'deploy', failWithUsage)

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

function createTypeCheckInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'type-check', failWithUsage)
  const [target, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'type-check', failWithUsage)

  if (!target) {
    return scriptInvocation('type-check', passthrough)
  }

  ensureTarget(target, TYPE_CHECK_TARGETS, 'type-check', failWithUsage)

  if (target === 'core') {
    return scriptInvocation('core:type-check', passthrough)
  }

  if (target === 'storybook') {
    return packageScriptInvocation('storybook', 'type-check', passthrough)
  }

  return scriptInvocation(`${target}:type-check`, passthrough)
}

function createTestInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'test', failWithUsage)
  const [target, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'test', failWithUsage)

  if (!target) {
    return scriptInvocation('test', passthrough)
  }

  ensureTarget(target, TEST_TARGETS, 'test', failWithUsage)
  return packageScriptInvocation(target, 'test', passthrough)
}

function createLintInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, ['--fix'], 'lint', failWithUsage)
  const [mode, ...rest] = positionals
  ensureNoExtraPositionals(rest, 'lint', failWithUsage)

  if (mode && mode !== 'fix') {
    failWithUsage(`unsupported lint mode "${mode}". Use "fix" or omit the mode.`, 'lint')
  }

  if (mode === 'fix' || flags.includes('--fix')) {
    return scriptInvocation('lint:fix', passthrough)
  }

  return scriptInvocation('lint', passthrough)
}

function createKillInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'kill', failWithUsage)
  ensureNoExtraPositionals(positionals, 'kill', failWithUsage)

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "kill".', 'kill')
  }

  return commandInvocation('sh', ['-c', 'killall node && killall caffeinate'])
}

function createOpenInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'open', failWithUsage)
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

function createPromoteInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'promote', failWithUsage)
  ensureNoExtraPositionals(positionals, 'promote', failWithUsage)

  if (passthrough.length > 0) {
    failWithUsage('passthrough args are not supported for "promote".', 'promote')
  }

  return commandInvocation('sh', ['scripts/promote-dev-to-main.sh'])
}

function createDbInvocation({ positionals, flags, passthrough, failWithUsage }) {
  ensureAllowedFlags(flags, [], 'db', failWithUsage)
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

    ensureNoExtraPositionals(rest, 'db', failWithUsage)
    return scriptInvocation(`db:${action}-local`, passthrough)
  }

  if (action === 'migrate') {
    const [environment, ...remainingPositionals] = [subaction, ...rest]
    ensureNoExtraPositionals(remainingPositionals, 'db', failWithUsage)

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
