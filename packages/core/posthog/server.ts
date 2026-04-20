import { createLogger } from '@valguide/logger'
import { PostHog } from 'posthog-node'
import { waitUntil } from '../platform/runtime/wait-until'
import {
  buildStudioAnalyticsProperties,
  POSTHOG_ORGANIZATION_GROUP,
  type StudioProductEventName,
} from './product-analytics'

let posthogServer: PostHog | null = null
const log = createLogger('posthog-server')

const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY

function deferPostHog(label: string, effect: Promise<void>) {
  waitUntil(
    effect.catch((error) => {
      log.error(`PostHog ${label} failed`, error)
    }),
  )
}

export function getPostHogServer(): PostHog | null {
  if (!POSTHOG_KEY) {
    return null
  }

  if (!posthogServer) {
    posthogServer = new PostHog(POSTHOG_KEY, {
      host: 'https://eu.i.posthog.com',
      enableExceptionAutocapture: true,
      // Serverless-optimized: send events immediately
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogServer
}

/**
 * Manually capture an exception on the server.
 * Use in try/catch blocks within server functions.
 */
export function captureServerException(error: Error, distinctId?: string, properties?: Record<string, unknown>) {
  const posthog = getPostHogServer()
  if (!posthog) return

  deferPostHog(
    'exception capture',
    posthog.captureImmediate({
      distinctId: distinctId ?? 'anonymous',
      event: '$exception',
      properties: {
        ...properties,
        $exception_message: error.message,
        $exception_type: error.name,
        $exception_stack_trace_raw: error.stack,
        $lib: 'posthog-node',
        environment: process.env.NODE_ENV,
      },
    }),
  )
}

/**
 * Flush PostHog events using waitUntil.
 * Call this at the end of server functions to ensure events are sent.
 */
export function flushPostHog() {
  const posthog = getPostHogServer()
  if (!posthog) return

  waitUntil(posthog.shutdown())
}

export function captureStudioProductEvent(input: {
  distinctId: string
  event: StudioProductEventName
  organizationNanoId?: string | null
  properties?: Record<string, unknown>
}) {
  const posthog = getPostHogServer()
  if (!posthog) return

  const organizationNanoId = input.organizationNanoId ?? null

  deferPostHog(
    `event capture (${input.event})`,
    posthog.captureImmediate({
      distinctId: input.distinctId,
      event: input.event,
      properties: {
        ...buildStudioAnalyticsProperties(input.properties, organizationNanoId ? { nanoId: organizationNanoId } : null),
        ...(organizationNanoId
          ? {
              $groups: {
                [POSTHOG_ORGANIZATION_GROUP]: organizationNanoId,
              },
            }
          : {}),
      },
    }),
  )
}
