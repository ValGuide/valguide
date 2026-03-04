import posthog from 'posthog-js'
import { useCallback, useRef } from 'react'
import { clientEnv } from '../env/client'
import type { SupportedLocale } from './i18n.config'

type MissingMessageError = {
  code: string
  message: string
}

type UseMissingMessageTrackerOptions = {
  appName: string
  locale: SupportedLocale
}

type MissingMessageEventProperties = {
  app_name: string
  locale: SupportedLocale
  route: string
  translation_key: string
  error_message: string
}

const MAX_QUEUE_SIZE = 200
const pendingExceptions: MissingMessageEventProperties[] = []

function extractMissingKey(message: string): string | null {
  const match = message.match(/`([^`]+)`/)
  return match?.[1] ?? null
}

function createMissingMessageError(properties: MissingMessageEventProperties): Error {
  return new Error(`Missing translation key: ${properties.translation_key}`)
}

function captureOrQueueMissingMessage(properties: MissingMessageEventProperties): void {
  if (posthog.__loaded) {
    posthog.captureException(createMissingMessageError(properties), properties)
    return
  }

  if (pendingExceptions.length >= MAX_QUEUE_SIZE) {
    pendingExceptions.shift()
  }
  pendingExceptions.push(properties)
}

export function flushMissingMessageQueue(): void {
  if (!posthog.__loaded || pendingExceptions.length === 0) return

  const exceptionsToFlush = pendingExceptions.splice(0, pendingExceptions.length)
  for (const properties of exceptionsToFlush) {
    posthog.captureException(createMissingMessageError(properties), properties)
  }
}

export function useMissingMessageTracker({ appName, locale }: UseMissingMessageTrackerOptions) {
  const reportedRef = useRef<Set<string>>(new Set())

  return useCallback(
    (error: MissingMessageError) => {
      if (error.code !== 'MISSING_MESSAGE') return
      if (!import.meta.env.PROD) return
      if (!clientEnv.VITE_POSTHOG_ENABLED) return

      const key = extractMissingKey(error.message)
      if (!key) return

      const route = window.location.pathname
      const dedupeId = `${appName}:${locale}:${route}:${key}`
      if (reportedRef.current.has(dedupeId)) return
      reportedRef.current.add(dedupeId)

      captureOrQueueMissingMessage({
        app_name: appName,
        locale,
        route,
        translation_key: key,
        error_message: error.message,
      })
    },
    [appName, locale],
  )
}
