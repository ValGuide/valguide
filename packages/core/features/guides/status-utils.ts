export type GuideStatus = 'published' | 'unpublished' | 'archived'
export type ChangeIndicator = 'up-to-date' | 'changed'

export type GuideStatusInput = {
  published: Date | null
  archivedAt: Date | null
}

export type TranslationInput = {
  hasPublished: boolean
}

export type GuideStatusDisplay = {
  status: GuideStatus
  indicator: ChangeIndicator | null
}

export type StopTranslationStatus = 'published' | 'unpublished' | 'archived'

export type StopTranslationStatusDisplay = {
  status: StopTranslationStatus
  indicator: ChangeIndicator | null
}

export function getGuideStatus(guide: GuideStatusInput): GuideStatus {
  if (guide.archivedAt !== null) {
    return 'archived'
  }
  if (guide.published === null) {
    return 'unpublished'
  }
  return 'published'
}

export function getGuideStatusDisplay(guide: GuideStatusInput): GuideStatusDisplay {
  const status = getGuideStatus(guide)
  const indicator: ChangeIndicator | null = status === 'published' ? 'up-to-date' : null
  return { status, indicator }
}

export function getStopTranslationStatusDisplay(
  translation: TranslationInput,
  archivedAt: Date | null,
): StopTranslationStatusDisplay {
  if (archivedAt !== null) {
    return { status: 'archived', indicator: null }
  }

  return {
    status: translation.hasPublished ? 'published' : 'unpublished',
    indicator: translation.hasPublished ? 'up-to-date' : null,
  }
}
