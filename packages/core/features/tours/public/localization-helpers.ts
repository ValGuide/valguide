/**
 * Localization helpers for published tour/stop content.
 * Used by the consumer-facing app to get localized text with fallbacks.
 */

import type { PublishedStopTranslation, PublishedTranslation } from './types'

/**
 * Get localized tour text (title or description) with fallback.
 */
export function getLocalizedTourText(
  tour: { translations: PublishedTranslation[] },
  field: 'title' | 'description',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = tour.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = tour.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  const firstTranslation = tour.translations[0]
  return firstTranslation?.[field] || ''
}

/**
 * Get localized stop text (title, description, or transcription) with fallback.
 */
export function getLocalizedStopText(
  stop: { translations: PublishedStopTranslation[] },
  field: 'title' | 'description' | 'transcription',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  const firstTranslation = stop.translations[0]
  return firstTranslation?.[field] || ''
}
