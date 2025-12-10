import type { GuideWithStops, StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { supportedLocales } from '@valguide/i18n/i18n.config'

export type TranslationLocaleStatus = 'published' | 'draft' | 'empty'

export type LocaleStatusMap = Record<SupportedLocale, TranslationLocaleStatus>

type TranslationLike = {
  locale: string
  currentVersionId?: string | null
  draftVersionId?: string | null
  currentVersion?: { status?: string | null } | null
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

export function getGuideLocaleStatusMap(guide: GuideWithStops): LocaleStatusMap {
  const statusMap = {} as LocaleStatusMap

  for (const locale of supportedLocales) {
    const translation = guide.translations.find((t) => t.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(translation)
  }

  return statusMap
}

export function getStopLocaleStatusMap(stop: StopWithTranslations): LocaleStatusMap {
  const statusMap = {} as LocaleStatusMap

  for (const locale of supportedLocales) {
    const translation = stop.translations.find((t) => t.locale === locale)
    statusMap[locale] = getTranslationLocaleStatus(translation)
  }

  return statusMap
}

export type LocaleTranslationSummary = {
  locale: SupportedLocale
  guideStatus: TranslationLocaleStatus
  stopsPublished: number
  stopsDraft: number
  stopsEmpty: number
  totalStops: number
}

export function getGuideLocaleSummary(guide: GuideWithStops, locale: SupportedLocale): LocaleTranslationSummary {
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

export function getOverallTranslationProgress(guide: GuideWithStops): {
  translatedLocales: number
  totalLocales: number
} {
  let translatedLocales = 0

  for (const locale of supportedLocales) {
    const translation = guide.translations.find((t) => t.locale === locale)
    const status = getTranslationLocaleStatus(translation)
    if (status !== 'empty') {
      translatedLocales++
    }
  }

  return {
    translatedLocales,
    totalLocales: supportedLocales.length,
  }
}

export function getStopsTranslationProgress(
  stops: StopWithTranslations[],
  locale: SupportedLocale,
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
