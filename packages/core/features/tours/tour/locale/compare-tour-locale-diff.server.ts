import { getTourLocaleDraft } from './get-tour-locale-draft.server'
import { getTourLocalePublished } from './get-tour-locale-published.server'

// =============================================================================
// TYPES
// =============================================================================

export type FieldDiff = {
  field: string
  draft: string | null
  published: string | null
  hasChanged: boolean
}

export type TourLocaleDiffResult = {
  hasChanges: boolean
  changedFields: string[]
  fieldDiffs: FieldDiff[]
  publishedAt: Date | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function compareTourLocaleDiff(nanoId: string, locale: string): Promise<TourLocaleDiffResult | null> {
  const [draft, published] = await Promise.all([
    getTourLocaleDraft(nanoId, locale),
    getTourLocalePublished(nanoId, locale),
  ])

  if (!draft) return null

  if (!published) {
    // Never published — all non-empty fields are "new"
    // Treat empty strings as equivalent to null (no meaningful content)
    const hasContent = (value: string | null) => value !== null && value.trim() !== ''
    const fieldDiffs: FieldDiff[] = [
      { field: 'title', draft: draft.title, published: null, hasChanged: hasContent(draft.title) },
      { field: 'description', draft: draft.description, published: null, hasChanged: hasContent(draft.description) },
    ]

    return {
      hasChanges: fieldDiffs.some((f) => f.hasChanged),
      changedFields: fieldDiffs.filter((f) => f.hasChanged).map((f) => f.field),
      fieldDiffs,
      publishedAt: null,
    }
  }

  // Compare each field (normalize empty strings to null for comparison)
  const normalize = (value: string | null) => (value?.trim() === '' ? null : value)
  const fieldDiffs: FieldDiff[] = [
    {
      field: 'title',
      draft: draft.title,
      published: published.title,
      hasChanged: normalize(draft.title) !== normalize(published.title),
    },
    {
      field: 'description',
      draft: draft.description,
      published: published.description,
      hasChanged: normalize(draft.description) !== normalize(published.description),
    },
  ]

  return {
    hasChanges: fieldDiffs.some((f) => f.hasChanged),
    changedFields: fieldDiffs.filter((f) => f.hasChanged).map((f) => f.field),
    fieldDiffs,
    publishedAt: published.publishedAt,
  }
}
