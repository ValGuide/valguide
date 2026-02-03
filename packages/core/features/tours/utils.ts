import type { TourWithTourStops, TourWithStops, TourWithTranslations, StopWithTranslations } from './types'

// =============================================================================
// LOCALE FALLBACK PRIORITY
// =============================================================================

/**
 * Priority order for locale fallback when preferred locale is missing.
 * Used in SQL CASE expressions for picking the best available title.
 */
export const LOCALE_PRIORITY = ['en', 'de', 'rm'] as const

/**
 * Pick the best locale from an array based on fallback priority.
 * Useful for client-side title resolution when all locales are loaded.
 *
 * @param preferredLocale - The user's preferred locale
 * @param locales - Array of locale objects with locale and title properties
 * @returns The locale object with the best available title, or undefined if empty
 */
export function pickBestLocale<T extends { locale: string; title: string | null }>(
  preferredLocale: string,
  locales: T[],
): T | undefined {
  if (locales.length === 0) return undefined

  // 1. Preferred locale with title
  const preferred = locales.find((l) => l.locale === preferredLocale && l.title?.trim())
  if (preferred) return preferred

  // 2. Fallback priority (en → de → rm) with title
  for (const fallback of LOCALE_PRIORITY) {
    if (fallback === preferredLocale) continue
    const found = locales.find((l) => l.locale === fallback && l.title?.trim())
    if (found) return found
  }

  // 3. Any locale with a title
  const anyWithTitle = locales.find((l) => l.title?.trim())
  if (anyWithTitle) return anyWithTitle

  // 4. First available locale (even without title)
  return locales[0]
}

// =============================================================================
// VERSIONED TRANSLATIONS
// =============================================================================

type VersionedTranslation = {
  currentVersion?: { title?: string | null; description?: string | null; transcription?: string | null } | null
  draftVersion?: { title?: string | null; description?: string | null; transcription?: string | null } | null
}

export function getVersionedField<T extends VersionedTranslation, K extends 'title' | 'description' | 'transcription'>(
  translation: T | undefined | null,
  field: K,
  preferDraft = false,
): string {
  if (!translation) return ''
  const { currentVersion, draftVersion } = translation
  if (preferDraft) {
    return draftVersion?.[field] ?? currentVersion?.[field] ?? ''
  }
  return currentVersion?.[field] ?? draftVersion?.[field] ?? ''
}

export function normalizeDescription(description: string | null | undefined): string {
  if (!description) return ''

  const trimmed = description.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('{')) {
    return trimmed
  }

  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }],
      },
    ],
  })
}

/**
 * Convert TourWithTourStops (junction table format) to TourWithStops (flat stops array)
 * Use this for backward compatibility with UI components that expect flat stops array
 */
export function toTourWithStops(tour: TourWithTourStops): TourWithStops {
  return {
    ...tour,
    stops: tour.tourStops.map((ts) => ({
      ...ts.stop,
      // Include position from junction table as order for backward compatibility
      order: ts.position,
    })),
  }
}

/**
 * Helper function to get localized text from current version with fallback
 */
export function getLocalizedTourText(
  tour: TourWithTranslations,
  field: 'title' | 'description',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = tour.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = tour.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  // Return the first available translation
  const firstTranslation = tour.translations[0]
  return firstTranslation?.currentVersion?.[field] || ''
}

/**
 * Helper function to get localized stop text from current version with fallback
 */
export function getLocalizedStopText(
  stop: StopWithTranslations,
  field: 'title' | 'description' | 'transcription',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  // Return the first available translation
  const firstTranslation = stop.translations[0]
  return firstTranslation?.currentVersion?.[field] || ''
}
