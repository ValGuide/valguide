import { getRequestHeaders } from '@tanstack/react-start/server'
import { createLogger } from '@valguide/logger'

const log = createLogger('studio-performance')

type StudioPerformanceMetadata = Record<string, unknown>

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

export function getStudioPerformanceContext(): StudioPerformanceMetadata {
  try {
    const headers = getRequestHeaders()
    const host = headers.get('host')
    const rayId = headers.get('cf-ray')

    return {
      host,
      country: headers.get('cf-ipcountry'),
      rayId,
      ingressColo: rayId?.split('-').pop() ?? null,
      requestKind: getRequestKind(headers),
      refererPath: getRefererPath(headers),
    }
  } catch {
    return {
      requestKind: 'unknown',
    }
  }
}

export function shouldLogStudioPerformance(): boolean {
  const host = getStudioPerformanceContext().host
  return host === 'studio.valguide.com' || host === 'studio.valguide.dev' || host === 'studio.local.dev'
}

export function logStudioPerformance(event: string, metadata: StudioPerformanceMetadata = {}): void {
  if (!shouldLogStudioPerformance()) {
    return
  }

  log.info('studio.performance', {
    event,
    ...getStudioPerformanceContext(),
    ...metadata,
  })
}

export async function timeStudioPerformance<T>(
  event: string,
  operation: () => Promise<T>,
  metadata: StudioPerformanceMetadata = {},
): Promise<T> {
  if (!shouldLogStudioPerformance()) {
    return operation()
  }

  const startedAt = nowMs()

  try {
    const result = await operation()
    logStudioPerformance(event, {
      ...metadata,
      durationMs: roundDuration(nowMs() - startedAt),
      outcome: 'ok',
    })
    return result
  } catch (error) {
    logStudioPerformance(event, {
      ...metadata,
      durationMs: roundDuration(nowMs() - startedAt),
      outcome: 'error',
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
