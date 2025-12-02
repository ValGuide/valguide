import type { SupportedLocale } from '@valguide/i18n/i18n.config'

// Guide routes
export function guideDetailUrl(nanoId: string) {
  return `/guides/${nanoId}` as const
}

export function guideEditUrl(nanoId: string) {
  return `/guides/${nanoId}/edit` as const
}

export function guideStopEditUrl(nanoId: string, stopId: string) {
  return `/guides/${nanoId}/stops/${stopId}/edit` as const
}

// Stop routes
export function stopsListUrl() {
  return '/stops' as const
}

export function stopEditUrl(stopNanoId: string) {
  return `/stops/${stopNanoId}/edit` as const
}
