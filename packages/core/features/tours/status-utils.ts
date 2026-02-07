export type TourStatus = 'published' | 'unpublished' | 'archived'
export type ChangeIndicator = 'up-to-date' | 'changed'

export type TourStatusInput = {
  publishedAt: Date | null
  archivedAt: Date | null
}

export type TranslationInput = {
  hasPublished: boolean
}

export type TourStatusDisplay = {
  status: TourStatus
  indicator: ChangeIndicator | null
}

export type StopTranslationStatus = 'published' | 'unpublished' | 'archived'

export type StopTranslationStatusDisplay = {
  status: StopTranslationStatus
  indicator: ChangeIndicator | null
}

export function getTourStatus(tour: TourStatusInput): TourStatus {
  if (tour.archivedAt !== null) {
    return 'archived'
  }
  if (tour.publishedAt === null) {
    return 'unpublished'
  }
  return 'published'
}

export function getTourStatusDisplay(tour: TourStatusInput, hasChanges?: boolean): TourStatusDisplay {
  const status = getTourStatus(tour)
  const indicator: ChangeIndicator | null = status === 'published' ? (hasChanges ? 'changed' : 'up-to-date') : null
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
