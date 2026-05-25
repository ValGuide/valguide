import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

const CONFIG_DIRECTORY = join(homedir(), '.config', 'valguide')
const CONFIG_FILE = join(CONFIG_DIRECTORY, 'telemetry.json')
const POSTHOG_CAPTURE_URL = 'https://eu.i.posthog.com/capture/'
const DEFAULT_TELEMETRY_PROJECT_KEY = 'phc_xHD27kdfBk6N9BJDYJjgE8kiZqGw5MZHLNjRcCCNjBys'
const REQUEST_TIMEOUT_MS = 750

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off'])

export const TELEMETRY_HELP = `Usage:
  val telemetry status
  val telemetry enable
  val telemetry disable

Notes:
  ValGuide CLI telemetry records anonymous install and dev command usage.
  It never sends command arguments, file paths, environment values, or project data.
  Set VALGUIDE_TELEMETRY_DISABLED=1 to opt out for a shell or CI job.
`

function parseBoolean(value) {
  if (!value) return null

  const normalizedValue = value.toLowerCase()
  if (TRUE_VALUES.has(normalizedValue)) return true
  if (FALSE_VALUES.has(normalizedValue)) return false

  return null
}

function telemetryProjectKey() {
  if (process.env.VALGUIDE_TELEMETRY_KEY) {
    return { key: process.env.VALGUIDE_TELEMETRY_KEY, source: 'VALGUIDE_TELEMETRY_KEY' }
  }

  if (process.env.POSTHOG_PROJECT_KEY) {
    return { key: process.env.POSTHOG_PROJECT_KEY, source: 'POSTHOG_PROJECT_KEY' }
  }

  if (process.env.VITE_POSTHOG_KEY) {
    return { key: process.env.VITE_POSTHOG_KEY, source: 'VITE_POSTHOG_KEY' }
  }

  return { key: DEFAULT_TELEMETRY_PROJECT_KEY, source: 'built-in ValGuide CLI telemetry project' }
}

function isCi() {
  return parseBoolean(process.env.CI) === true || Boolean(process.env.GITHUB_ACTIONS)
}

async function readTelemetryConfig() {
  try {
    const config = JSON.parse(await readFile(CONFIG_FILE, 'utf8'))
    if (config && typeof config === 'object' && !Array.isArray(config)) {
      return config
    }

    return {}
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    return {}
  }
}

async function writeTelemetryConfig(config) {
  await mkdir(CONFIG_DIRECTORY, { recursive: true })
  await writeFile(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`)
}

async function getAnonymousId(config) {
  if (typeof config.anonymousId === 'string' && config.anonymousId) {
    return config.anonymousId
  }

  const anonymousId = randomUUID()
  await writeTelemetryConfig({ ...config, anonymousId })
  return anonymousId
}

function hashValue(value) {
  return createHash('sha256').update(value).digest('hex')
}

async function getTelemetryState() {
  const envDisabled = parseBoolean(process.env.VALGUIDE_TELEMETRY_DISABLED)
  if (envDisabled === true) {
    return { enabled: false, reason: 'VALGUIDE_TELEMETRY_DISABLED=1' }
  }

  const envEnabled = parseBoolean(process.env.VALGUIDE_TELEMETRY_ENABLED)
  if (envEnabled === false) {
    return { enabled: false, reason: 'VALGUIDE_TELEMETRY_ENABLED=0' }
  }

  if (isCi()) {
    return { enabled: false, reason: 'CI environment' }
  }

  const config = await readTelemetryConfig()
  if (config.enabled === false) {
    return { enabled: false, reason: `${CONFIG_FILE} opt-out`, config }
  }

  const { key, source: keySource } = telemetryProjectKey()
  if (!key) {
    return { enabled: false, reason: 'no telemetry key configured', config }
  }

  return { enabled: true, key, keySource, config }
}

export async function trackValTelemetry(event, properties = {}) {
  const state = await getTelemetryState()
  if (!state.enabled) return false

  const anonymousId = await getAnonymousId(state.config)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: state.key,
        event,
        distinct_id: anonymousId,
        properties: {
          app: 'val-cli',
          cli: 'val',
          node_major: Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10),
          os: platform(),
          anonymous_id_hash: hashValue(anonymousId),
          ...properties,
        },
      }),
      signal: controller.signal,
    })

    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export async function handleTelemetryCommand(args, failWithUsage) {
  const [action, ...rest] = args
  if (rest.length > 0) {
    failWithUsage(`unexpected argument "${rest[0]}" for "telemetry"`, 'telemetry')
  }

  if (action === 'status') {
    const state = await getTelemetryState()
    if (state.enabled) {
      console.log('ValGuide CLI telemetry is enabled.')
      console.log(`Project key source: ${state.keySource}.`)
    } else {
      console.log(`ValGuide CLI telemetry is disabled: ${state.reason}.`)
    }
    console.log(`Config: ${CONFIG_FILE}`)
    return
  }

  if (action === 'enable') {
    const config = await readTelemetryConfig()
    await writeTelemetryConfig({ ...config, enabled: true })
    console.log(`ValGuide CLI telemetry enabled in ${CONFIG_FILE}`)
    console.log('Run "val telemetry status" to confirm the active project key source.')
    return
  }

  if (action === 'disable') {
    const config = await readTelemetryConfig()
    await writeTelemetryConfig({ ...config, enabled: false })
    console.log(`ValGuide CLI telemetry disabled in ${CONFIG_FILE}`)
    return
  }

  failWithUsage(`missing or unsupported telemetry action "${action ?? ''}".`, 'telemetry')
}
