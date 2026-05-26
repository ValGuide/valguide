const PRIVATE_IPV4_PATTERNS = [/^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./]

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0', '::1'])

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim()
  let url: URL

  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('Enter a valid URL.')
  }

  if (url.protocol !== 'https:') {
    throw new Error('External links must use https://.')
  }

  const hostname = url.hostname.toLowerCase()

  if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith('.local')) {
    throw new Error('Local hostnames are not allowed.')
  }

  if (PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error('Private network URLs are not allowed.')
  }

  url.hash = ''
  return url.toString()
}

export function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${label} is required.`)
  }
  return trimmed
}

export function parseOptionalExpiry(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Enter a valid expiry date.')
  }
  return date
}
