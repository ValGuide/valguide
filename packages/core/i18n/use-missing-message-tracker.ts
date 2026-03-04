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

function extractMissingKey(message: string): string | null {
  const match = message.match(/`([^`]+)`/)
  return match?.[1] ?? null
}

export function useMissingMessageTracker({ appName, locale }: UseMissingMessageTrackerOptions) {
  const reportedRef = useRef<Set<string>>(new Set())

  return useCallback(
    (error: MissingMessageError) => {
      if (error.code !== 'MISSING_MESSAGE') return
      if (!import.meta.env.PROD) return
      if (!clientEnv.VITE_POSTHOG_ENABLED) return
      if (!posthog.__loaded) return

      const key = extractMissingKey(error.message)
      if (!key) return

      const route = window.location.pathname
      const dedupeId = `${appName}:${locale}:${route}:${key}`
      if (reportedRef.current.has(dedupeId)) return
      reportedRef.current.add(dedupeId)

      posthog.capture('i18n_missing_message', {
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
