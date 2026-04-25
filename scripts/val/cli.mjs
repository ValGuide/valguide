import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fail, isFlag, quotedList, shellWords, splitPassthrough } from './helpers.mjs'

const COMPLETION_SHELLS = ['zsh']
const COMPLETION_HELP = `Usage:
  val completion <zsh>
  val completion install <zsh>

Supported shells:
  ${COMPLETION_SHELLS.join(', ')}

Examples:
  eval "$(val completion zsh)"
  val completion zsh > ~/.zsh/completions/_val
  val completion install zsh
`

export function createValCli({ name = 'ValGuide CLI', cwd = process.cwd() } = {}) {
  const commands = new Map()
  const shortcuts = new Map()
  const targetSections = []
  const examples = []

  function registerCommand(command, options = {}) {
    if (!command?.name) {
      throw new Error('val command registrations require a name')
    }

    if (commands.has(command.name) && !options.override) {
      throw new Error(`val command "${command.name}" is already registered`)
    }

    commands.set(command.name, command)
  }

  function registerCommands(commandList, options = {}) {
    for (const command of commandList) {
      registerCommand(command, options)
    }
  }

  function registerShortcut(shortcut, commandName, args = []) {
    if (shortcuts.has(shortcut)) {
      throw new Error(`val shortcut "${shortcut}" is already registered`)
    }

    shortcuts.set(shortcut, { commandName, args })
  }

  function registerTargetSection(name, targets) {
    targetSections.push([name, targets])
  }

  function addExamples(values) {
    examples.push(...values)
  }

  function commandHelp(commandName) {
    if (commandName === 'completion') {
      return COMPLETION_HELP
    }

    const command = commands.get(commandName)
    return command?.help
  }

  function failWithUsage(message, commandName) {
    const help = commandHelp(commandName)
    if (!help) {
      fail(message)
    }

    fail(`${message}\n\n${help}`)
  }

  function printHelp(commandName) {
    if (!commandName) {
      console.log(generalHelp())
      return
    }

    const shortcut = shortcuts.get(commandName)
    const help = shortcut ? commandHelp(shortcut.commandName) : commandHelp(commandName)
    if (!help) {
      fail(`unknown command "${commandName}"`)
    }

    console.log(help)
  }

  function generalHelp() {
    const commandLines = [...commands.values()]
      .map((command) => `  ${command.usage.padEnd(28)} ${command.summary}`)
      .join('\n')
    const shortcutValues = [...shortcuts.keys()]

    return `${name}

Usage:
  val <command|target> [args] [-- passthrough]

Commands:
  help [command]             Show general or command-specific help
  targets                    List supported targets
  completion <shell>         Print shell completion script
  completion install <shell> Install shell completion script
${commandLines}

Shorthand:
  val <dev-target> [...]     Equivalent to "val dev <dev-target> [...]"${
    shortcutValues.length > 0 ? `\n  Supported dev targets: ${shortcutValues.join(', ')}` : ''
  }

Examples:
${examples.map((example) => `  ${example}`).join('\n')}
`
  }

  function printTargets() {
    console.log('Supported targets:')
    for (const [command, targets] of targetSections) {
      console.log(`  ${command}: ${targets.join(', ')}`)
    }
  }

  function ensureCompletionShell(shell) {
    if (!shell) {
      failWithUsage(`missing shell for "completion". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
    }

    if (!COMPLETION_SHELLS.includes(shell)) {
      failWithUsage(`unsupported shell "${shell}". Supported shells: ${quotedList(COMPLETION_SHELLS)}.`, 'completion')
    }
  }

  function zshCompletionScript() {
    const completionCommands = [
      'help:Show general or command-specific help',
      'targets:List supported targets',
      'completion:Print shell completion script',
      ...[...commands.values()].map((command) => `${command.name}:${command.summary}`),
      ...[...shortcuts.keys()].map((shortcut) => `${shortcut}:Start local development`),
    ]

    return `#compdef val

local context state line
typeset -A opt_args
local -a commands

commands=(${shellWords(completionCommands)})

_arguments -C \\
  '1:command:->command' \\
  '*::args:'

case $state in
  command)
    _describe -t commands 'val command' commands
    ;;
esac
`
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
      if (extraArgs.length > 0) {
        failWithUsage(`unexpected argument "${extraArgs[0]}" for "completion"`, 'completion')
      }

      await installCompletion(maybeShell)
      return
    }

    const extraCompletionArgs = [maybeShell, ...extraArgs].filter(Boolean)
    if (extraCompletionArgs.length > 0) {
      failWithUsage(`unexpected argument "${extraCompletionArgs[0]}" for "completion"`, 'completion')
    }

    console.log(getCompletionScript(actionOrShell))
  }

  function runInvocation(invocation) {
    const commandLine = invocation.shell ? invocation.command : [invocation.command, ...invocation.args].join(' ')
    console.log(`> ${commandLine}`)

    const child = spawn(invocation.command, invocation.args, {
      cwd: invocation.cwd ?? cwd,
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

  async function run(argv) {
    const { args, passthrough } = splitPassthrough(argv)

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      printHelp()
      return
    }

    let [commandName, ...rest] = args

    if (commandName === 'help') {
      printHelp(rest[0])
      return
    }

    if (commandName === 'targets') {
      printTargets()
      return
    }

    if (commandName === 'completion') {
      await handleCompletion(rest)
      return
    }

    const shortcut = shortcuts.get(commandName)
    if (shortcut) {
      rest = [...shortcut.args, ...rest]
      commandName = shortcut.commandName
    }

    const command = commands.get(commandName)
    if (!command) {
      fail(`unknown command "${commandName}". Run "val help" to see the available commands.`)
    }

    const flags = rest.filter(isFlag)
    const positionals = rest.filter((value) => !isFlag(value))
    const invocation = await command.createInvocation({
      command: commandName,
      positionals,
      flags,
      passthrough,
      failWithUsage,
      cwd,
    })

    if (invocation) {
      runInvocation(invocation)
    }
  }

  return {
    addExamples,
    registerCommand,
    registerCommands,
    registerShortcut,
    registerTargetSection,
    run,
  }
}
