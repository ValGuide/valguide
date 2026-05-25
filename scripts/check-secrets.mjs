#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { basename, relative, resolve } from 'node:path'

const MAX_TEXT_BYTES = 2 * 1024 * 1024
const IGNORE_MARKER = 'secret-scan: allow'

const SKIPPED_PATH_PATTERNS = [
  /(^|\/)\.git\//,
  /(^|\/)node_modules\//,
  /(^|\/)\.nx\//,
  /(^|\/)\.next\//,
  /(^|\/)\.tanstack\//,
  /(^|\/)\.wrangler\//,
  /(^|\/)coverage\//,
  /(^|\/)dist\//,
  /(^|\/)dist-ssr\//,
  /(^|\/)build\//,
  /(^|\/)out\//,
  /(^|\/)tmp\//,
  /(^|\/)\.env-merged\//,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
]

const SKIPPED_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.webp',
  '.woff',
  '.woff2',
])

const KNOWN_SECRET_PATTERNS = [
  {
    name: 'private key block',
    regex: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/,
  },
  {
    name: 'AWS access key id',
    regex: /\b(?:A3T[A-Z0-9]|AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    name: 'GitHub token',
    regex: /\b(?:gh[pousr]_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{80,})\b/,
  },
  {
    name: 'Slack token',
    regex: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/,
  },
  {
    name: 'OpenAI API key',
    regex: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    name: 'Stripe live secret key',
    regex: /\bsk_live_[A-Za-z0-9]{20,}\b/,
  },
  {
    name: 'Linear API key',
    regex: /\blin_api_[A-Za-z0-9]{20,}\b/,
  },
  {
    name: 'Resend API key',
    regex: /\bre_[A-Za-z0-9]{20,}\b/,
  },
]

const SENSITIVE_ASSIGNMENT_REGEX =
  /\b([A-Za-z][A-Za-z0-9_.-]*(?:secret|token|password|api[_-]?key|private[_-]?key|client[_-]?secret|database[_-]?url)[A-Za-z0-9_.-]*)\b\s*[:=]\s*["']?([^"'\s#`,]+)/gi

function usage() {
  return `Usage:
  pnpm secrets:check
  pnpm secrets:check --staged
  pnpm secrets:check --files <path...>

Options:
  --staged      Scan staged added, copied, modified, and renamed files.
  --files       Scan explicit file paths passed after the flag.
  --help        Show this help.

Lines containing "${IGNORE_MARKER}" are skipped for intentional fixtures.`
}

function gitFiles(args) {
  const output = execFileSync('git', args, { encoding: 'buffer' })
  return output.toString('utf8').split('\0').filter(Boolean)
}

function parseArgs(argv) {
  if (argv[0] === '--') {
    argv = argv.slice(1)
  }

  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(usage())
    process.exit(0)
  }

  if (argv.length === 0) {
    return {
      files: gitFiles(['ls-files', '-z', '--cached', '--others', '--exclude-standard']),
      source: 'worktree',
    }
  }

  if (argv.length === 1 && argv[0] === '--staged') {
    return {
      files: gitFiles(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']),
      source: 'index',
    }
  }

  if (argv[0] === '--files') {
    const files = argv.slice(1)
    if (files.length === 0) {
      fail('missing file path after --files')
    }
    return { files, source: 'worktree' }
  }

  fail(`unsupported arguments: ${argv.join(' ')}`)
}

function fail(message) {
  console.error(`secret scan: ${message}`)
  process.exit(2)
}

function normalizedPath(filePath) {
  const absolutePath = resolve(filePath)
  const relativePath = relative(process.cwd(), absolutePath)
  return relativePath.startsWith('..') ? absolutePath : relativePath
}

function shouldSkipPath(filePath) {
  const normalized = normalizedPath(filePath)
  if (SKIPPED_PATH_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true
  }

  const name = basename(normalized).toLowerCase()
  return [...SKIPPED_EXTENSIONS].some((extension) => name.endsWith(extension))
}

function isBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000))
  return sample.includes(0)
}

function isPlaceholderValue(rawValue) {
  const value = rawValue.trim().replace(/^[{([]+|[}),;\]]+$/g, '')
  const normalized = value.toLowerCase()

  if (!value || value.startsWith('$') || value.includes('${') || value.startsWith('process.env.')) {
    return true
  }

  if (normalized.startsWith('<') || normalized.endsWith('>')) {
    return true
  }

  if (/^(true|false|null|undefined|none|not-set|todo|tbd)$/i.test(value)) {
    return true
  }

  if (
    /^(your|example|sample|dummy|fake|test|local|localhost|change[-_]?me|replace[-_]?with|placeholder|redacted)/i.test(
      value,
    )
  ) {
    return true
  }

  if (/^(x+|0+|1+|a+|z+)$/i.test(value)) {
    return true
  }

  return false
}

function shannonEntropy(value) {
  const counts = new Map()
  for (const char of value) {
    counts.set(char, (counts.get(char) ?? 0) + 1)
  }

  let entropy = 0
  for (const count of counts.values()) {
    const probability = count / value.length
    entropy -= probability * Math.log2(probability)
  }
  return entropy
}

function hasMixedSecretShape(value) {
  return (
    value.length >= 20 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[-_+/=]/.test(value) &&
    shannonEntropy(value) >= 3.5
  )
}

function isPublicPostHogProjectToken(value) {
  return /^phc_[A-Za-z0-9]{40,}$/.test(value)
}

function isLocalHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.example') ||
    hostname === 'example.com'
  )
}

function isSensitiveUrl(value) {
  try {
    const url = new URL(value)
    const sensitiveProtocol = ['postgres:', 'postgresql:', 'mysql:', 'redis:', 'rediss:'].includes(url.protocol)
    if (!sensitiveProtocol || isLocalHost(url.hostname)) {
      return false
    }

    return Boolean(url.username && url.password && !isPlaceholderValue(url.password))
  } catch {
    return false
  }
}

function isSuspiciousAssignedValue(value) {
  const cleanedValue = value.trim().replace(/[),;\]}]+$/g, '')
  if (isPlaceholderValue(cleanedValue)) {
    return false
  }

  if (isPublicPostHogProjectToken(cleanedValue)) {
    return false
  }

  if (
    /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z0-9_$]+)+$/.test(cleanedValue) ||
    /^[A-Za-z_$][A-Za-z0-9_$]*\(/.test(cleanedValue) ||
    (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleanedValue) && cleanedValue.length < 32)
  ) {
    return false
  }

  if (isSensitiveUrl(cleanedValue)) {
    return true
  }

  if (cleanedValue.length < 16) {
    return false
  }

  return cleanedValue.length >= 32 || hasMixedSecretShape(cleanedValue)
}

function scanLine(filePath, line, lineNumber) {
  if (line.includes(IGNORE_MARKER)) {
    return []
  }

  const findings = []
  for (const pattern of KNOWN_SECRET_PATTERNS) {
    if (pattern.regex.test(line)) {
      findings.push({
        filePath,
        lineNumber,
        detector: pattern.name,
      })
    }
  }

  SENSITIVE_ASSIGNMENT_REGEX.lastIndex = 0
  for (const match of line.matchAll(SENSITIVE_ASSIGNMENT_REGEX)) {
    const key = match[1]
    const value = match[2]
    if (isSuspiciousAssignedValue(value)) {
      findings.push({
        filePath,
        lineNumber,
        detector: `sensitive assignment (${key})`,
      })
    }
  }

  return findings
}

function readIndexFile(filePath) {
  try {
    return execFileSync('git', ['show', `:${filePath}`], { encoding: 'buffer' })
  } catch {
    return null
  }
}

function readWorktreeFile(filePath) {
  if (!existsSync(filePath)) {
    return null
  }

  const stat = statSync(filePath)
  if (!stat.isFile()) {
    return null
  }

  return readFileSync(filePath)
}

function scanFile(filePath, source) {
  if (shouldSkipPath(filePath)) {
    return []
  }

  const buffer = source === 'index' ? readIndexFile(filePath) : readWorktreeFile(filePath)
  if (!buffer || buffer.length > MAX_TEXT_BYTES) {
    return []
  }

  if (isBinary(buffer)) {
    return []
  }

  const text = buffer.toString('utf8')
  const lines = text.split(/\r?\n/)
  const findings = []
  for (const [index, line] of lines.entries()) {
    findings.push(...scanLine(normalizedPath(filePath), line, index + 1))
  }
  return findings
}

function main() {
  const { files, source } = parseArgs(process.argv.slice(2))
  const findings = files.flatMap((filePath) => scanFile(filePath, source))

  if (findings.length === 0) {
    console.log(`Secret scan passed for ${files.length} file${files.length === 1 ? '' : 's'}.`)
    return
  }

  console.error('Secret scan found possible leaks:')
  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.lineNumber} ${finding.detector}`)
  }
  console.error(`\nIf this is an intentional fixture, move it to a non-secret placeholder or add "${IGNORE_MARKER}".`)
  process.exit(1)
}

main()
