import { getRequest, getRequestHeaders } from '@tanstack/react-start/server'
import { createLogger } from '@valguide/logger'

const log = createLogger('performance')

export type PerformanceMetadata = Record<string, unknown>
type CloudflareRequest = Request & {
  cf?: {
    colo?: string
  }
}

type PerformanceContext = PerformanceMetadata & {
  host?: string | null
}

type PerformanceOptions = {
  message?: string
  shouldLog?: (context: PerformanceContext) => boolean
}

const DEFAULT_MESSAGE = 'studio.performance'

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now()
}

function roundDuration(durationMs: number): number {
  return Math.round(durationMs * 100) / 100
}

function getRequestKind(headers: Headers): string {
  const destination = headers.get('sec-fetch-dest')
  if (destination === 'document') {
    return 'document'
  }

  const mode = headers.get('sec-fetch-mode')
  if (mode === 'cors' || mode === 'same-origin') {
    return 'subrequest'
  }

  const accept = headers.get('accept') ?? ''
  if (accept.includes('text/html')) {
    return 'document'
  }

  return destination ?? mode ?? 'unknown'
}

function getRefererPath(headers: Headers): string | null {
  const referer = headers.get('referer')
  if (!referer) {
    return null
  }

  try {
    return new URL(referer).pathname
  } catch {
    return null
  }
}

function defaultShouldLogPerformance(context: PerformanceContext): boolean {
  return (
    context.host === 'studio.valguide.com' ||
    context.host === 'studio.valguide.dev' ||
    context.host === 'studio.local.dev'
  )
}

export function getPerformanceContext(): PerformanceContext {
  try {
    const headers = getRequestHeaders()
    const request = getRequest() as CloudflareRequest
    const host = headers.get('host')
    const rayId = headers.get('cf-ray')

    return {
      host,
      country: headers.get('cf-ipcountry'),
      rayId,
      ingressColo: request.cf?.colo ?? null,
      requestKind: getRequestKind(headers),
      refererPath: getRefererPath(headers),
    }
  } catch {
    return {
      requestKind: 'unknown',
    }
  }
}

export function shouldLogPerformance(options: PerformanceOptions = {}): boolean {
  const context = getPerformanceContext()
  const shouldLog = options.shouldLog ?? defaultShouldLogPerformance
  return shouldLog(context)
}

export function logPerformance(
  event: string,
  metadata: PerformanceMetadata = {},
  options: PerformanceOptions = {},
): void {
  if (!shouldLogPerformance(options)) {
    return
  }

  log.info(options.message ?? DEFAULT_MESSAGE, {
    event,
    ...getPerformanceContext(),
    ...metadata,
  })
}

export async function timePerformance<T>(
  event: string,
  operation: () => Promise<T>,
  metadata: PerformanceMetadata = {},
  options: PerformanceOptions = {},
): Promise<T> {
  if (!shouldLogPerformance(options)) {
    return operation()
  }

  const startedAt = nowMs()

  try {
    const result = await operation()
    logPerformance(
      event,
      {
        ...metadata,
        durationMs: roundDuration(nowMs() - startedAt),
        outcome: 'ok',
      },
      options,
    )
    return result
  } catch (error) {
    logPerformance(
      event,
      {
        ...metadata,
        durationMs: roundDuration(nowMs() - startedAt),
        outcome: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
      options,
    )
    throw error
  }
}
