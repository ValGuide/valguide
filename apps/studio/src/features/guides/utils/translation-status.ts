import type { GuideWithStops, StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { TranslationStatus } from '@valguide/core/features/guides/types'

export type TranslationLocaleStatus = 'published' | 'draft' | 'empty' | 'modified'

export type LocaleStatusMap = Record<string, TranslationLocaleStatus>

type TranslationLike = {
  locale: string
  currentVersionId?: string | null
  draftVersionId?: string | null
  currentVersion?: { status?: string | null } | null
}

/**
 * Get locale status map from an array of translation statuses (lightweight, no content)
 * Used by the new editor context that doesn't have full translations
 */
export function getLocaleStatusMapFromStatuses(
  statuses: TranslationStatus[] | undefined,
  locales: string[],
): LocaleStatusMap {
  const statusMap: LocaleStatusMap = {}
  for (const locale of locales) {
    const tr = statuses?.find((t) => t.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(tr)
  }
  return statusMap
}

export function getTranslationLocaleStatus(translation: TranslationLike | undefined): TranslationLocaleStatus {
  if (!translation) return 'empty'

  const hasPublished = !!translation.currentVersionId
  const hasDraft = !!translation.draftVersionId

  if (hasDraft && !hasPublished) {
    return 'draft'
  }
  if (hasDraft && hasPublished) {
    return 'draft'
  }
  if (hasPublished) {
    return 'published'
  }
  return 'empty'
}

export function getGuideLocaleStatusMap(guide: GuideWithStops, locales?: string[]): LocaleStatusMap {
  const statusMap: LocaleStatusMap = {}
  const localesToCheck = locales ?? guide.availableLocales ?? ['en']

  for (const locale of localesToCheck) {
    const translation = guide.translations.find((t) => t.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(translation)
  }

  return statusMap
}

export function getStopLocaleStatusMap(stop: StopWithTranslations, locales?: string[]): LocaleStatusMap {
  const statusMap: LocaleStatusMap = {}
  const localesToCheck = locales ?? ['en']

  for (const locale of localesToCheck) {
    const translation = stop.translations.find((t) => t.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(translation)
  }

  return statusMap
}

export type LocaleTranslationSummary = {
  locale: string
  guideStatus: TranslationLocaleStatus
  stopsPublished: number
  stopsDraft: number
  stopsEmpty: number
  totalStops: number
}

export function getGuideLocaleSummary(guide: GuideWithStops, locale: string): LocaleTranslationSummary {
  const guideTranslation = guide.translations.find((t) => t.locale === locale)
  const guideStatus = getTranslationLocaleStatus(guideTranslation)

  let stopsPublished = 0
  let stopsDraft = 0
  let stopsEmpty = 0

  for (const stop of guide.stops) {
    const stopTranslation = stop.translations.find((t) => t.locale === locale)
    const stopStatus = getTranslationLocaleStatus(stopTranslation)

    switch (stopStatus) {
      case 'published':
        stopsPublished++
        break
      case 'draft':
        stopsDraft++
        break
      case 'empty':
        stopsEmpty++
        break
    }
  }

  return {
    locale,
    guideStatus,
    stopsPublished,
    stopsDraft,
    stopsEmpty,
    totalStops: guide.stops.length,
  }
}

export function getOverallTranslationProgress(guide: GuideWithStops & { availableLocales?: string[] }): {
  translatedLocales: number
  totalLocales: number
} {
  const locales = guide.availableLocales ?? ['en']
  let translatedLocales = 0

  for (const locale of locales) {
    const translation = guide.translations.find((t) => t.locale === locale)
    const status = getTranslationLocaleStatus(translation)
    if (status !== 'empty') {
      translatedLocales++
    }
  }

  return {
    translatedLocales,
    totalLocales: locales.length,
  }
}

export function getStopsTranslationProgress(
  stops: StopWithTranslations[],
  locale: string,
): { translated: number; total: number } {
  let translated = 0

  for (const stop of stops) {
    const translation = stop.translations.find((t) => t.locale === locale)
    const status = getTranslationLocaleStatus(translation)
    if (status !== 'empty') {
      translated++
    }
  }

  return {
    translated,
    total: stops.length,
  }
}
