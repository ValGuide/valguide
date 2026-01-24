export type GuideStatus = 'published' | 'unpublished' | 'archived'
export type ChangeIndicator = 'up-to-date' | 'changed'

export type GuideStatusInput = {
  published: Date | null
  archivedAt: Date | null
}

export type TranslationInput = {
  currentVersionId: string | null
  draftVersionId: string | null
}

export type AssetVersionInput = {
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
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

export function getChangeIndicator(translation: TranslationInput): ChangeIndicator | null {
  if (translation.currentVersionId === null) {
    return null
  }
  if (translation.draftVersionId === null || translation.draftVersionId === translation.currentVersionId) {
    return 'up-to-date'
  }
  return 'changed'
}

export function hasAssetChanges(assetVersion: AssetVersionInput | null): boolean {
  if (!assetVersion) return false
  return !!assetVersion.draftAssetVersionId
}

export function getGuideStatusDisplay(
  guide: GuideStatusInput,
  translation: TranslationInput | null,
  assetVersion?: AssetVersionInput | null,
): GuideStatusDisplay {
  const status = getGuideStatus(guide)
  const translationIndicator = translation ? getChangeIndicator(translation) : null
  const assetHasChanges = hasAssetChanges(assetVersion ?? null)

  // If either translation or assets have changes, show 'changed'
  let indicator: ChangeIndicator | null = translationIndicator
  if (status === 'published' && assetHasChanges && indicator !== 'changed') {
    indicator = 'changed'
  }

  return { status, indicator }
}

export function getStopTranslationStatusDisplay(
  translation: TranslationInput,
  archivedAt: Date | null,
): StopTranslationStatusDisplay {
  if (archivedAt !== null) {
    return { status: 'archived', indicator: null }
  }

  const hasPublished = translation.currentVersionId !== null
  const indicator = getChangeIndicator(translation)

  return {
    status: hasPublished ? 'published' : 'unpublished',
    indicator,
  }
}
