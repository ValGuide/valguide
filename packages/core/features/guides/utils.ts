import type { GuideWithGuideStops, GuideWithStops, GuideWithTranslations, StopWithTranslations } from './types'

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
 * Convert GuideWithGuideStops (junction table format) to GuideWithStops (flat stops array)
 * Use this for backward compatibility with UI components that expect flat stops array
 */
export function toGuideWithStops(guide: GuideWithGuideStops): GuideWithStops {
  return {
    ...guide,
    stops: guide.guideStops.map((gs) => ({
      ...gs.stop,
      // Include position from junction table as order for backward compatibility
      order: gs.position,
    })),
  }
}

/**
 * Helper function to get localized text from current version with fallback
 */
export function getLocalizedGuideText(
  guide: GuideWithTranslations,
  field: 'title' | 'description',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = guide.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = guide.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  // Return the first available translation
  const firstTranslation = guide.translations[0]
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
