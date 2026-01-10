import { waitUntil } from '@vercel/functions'
import { PostHog } from 'posthog-node'

let posthogServer: PostHog | null = null

const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY

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
export async function captureServerException(error: Error, distinctId?: string, properties?: Record<string, unknown>) {
  const posthog = getPostHogServer()
  if (!posthog) return

  // Use captureImmediate to guarantee HTTP request completes before function continues
  await posthog.captureImmediate({
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
  })
}

/**
 * Flush PostHog events using Vercel's waitUntil.
 * Call this at the end of server functions to ensure events are sent.
 */
export function flushPostHog() {
  const posthog = getPostHogServer()
  if (!posthog) return

  waitUntil(posthog.shutdown())
}
