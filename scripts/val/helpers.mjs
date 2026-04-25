export function splitPassthrough(argv) {
  const separatorIndex = argv.indexOf('--')
  if (separatorIndex === -1) {
    return { args: argv, passthrough: [] }
  }

  return {
    args: argv.slice(0, separatorIndex),
    passthrough: argv.slice(separatorIndex + 1),
  }
}

export function isFlag(value) {
  return value.startsWith('-')
}

export function normalizeFlags(flags) {
  return flags.map((flag) => {
    if (flag === '-n') {
      return '--no-open'
    }

    return flag
  })
}

export function fail(message) {
  console.error(`val: ${message}`)
  process.exit(1)
}

export function quotedList(values) {
  return values.map((value) => `"${value}"`).join(', ')
}

export function ensureNoExtraPositionals(positionals, command, failWithUsage) {
  if (positionals.length > 0) {
    failWithUsage(`unexpected argument "${positionals[0]}" for "${command}"`, command)
  }
}

export function ensureAllowedFlags(flags, allowedFlags, command, failWithUsage) {
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

export function ensureTarget(target, supportedTargets, command, failWithUsage) {
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

export function uniqueValues(values) {
  return [...new Set(values)]
}

export function extractEnvironmentFlag(flags, prefix, values, fallback, command, failWithUsage) {
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

export function commandInvocation(command, args = [], options = {}) {
  return {
    command,
    args,
    ...options,
  }
}

export function forwardedArgs(passthrough) {
  return passthrough.length > 0 ? ['--', ...passthrough] : []
}

export function shellWords(values) {
  return values.map((value) => `'${value.replaceAll("'", "'\\''")}'`).join(' ')
}
