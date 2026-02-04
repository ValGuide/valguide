import { getStopLocaleDraft } from './get-stop-locale-draft.server'
import { getStopLocalePublished } from './get-stop-locale-published.server'

// =============================================================================
// TYPES
// =============================================================================

export type FieldDiff = {
  field: string
  draft: string | null
  published: string | null
  hasChanged: boolean
}

export type StopLocaleDiffResult = {
  hasChanges: boolean
  changedFields: string[]
  fieldDiffs: FieldDiff[]
  publishedAt: Date | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function compareStopLocaleDiff(nanoId: string, locale: string): Promise<StopLocaleDiffResult | null> {
  const [draft, published] = await Promise.all([
    getStopLocaleDraft(nanoId, locale),
    getStopLocalePublished(nanoId, locale),
  ])

  if (!draft) return null

  if (!published) {
    // Never published — all non-empty fields are "new"
    const fieldDiffs: FieldDiff[] = [
      { field: 'title', draft: draft.title, published: null, hasChanged: draft.title !== null },
      { field: 'description', draft: draft.description, published: null, hasChanged: draft.description !== null },
      { field: 'transcription', draft: draft.transcription, published: null, hasChanged: draft.transcription !== null },
    ]

    return {
      hasChanges: fieldDiffs.some((f) => f.hasChanged),
      changedFields: fieldDiffs.filter((f) => f.hasChanged).map((f) => f.field),
      fieldDiffs,
      publishedAt: null,
    }
  }

  // Compare each field
  const fieldDiffs: FieldDiff[] = [
    {
      field: 'title',
      draft: draft.title,
      published: published.title,
      hasChanged: draft.title !== published.title,
    },
    {
      field: 'description',
      draft: draft.description,
      published: published.description,
      hasChanged: draft.description !== published.description,
    },
    {
      field: 'transcription',
      draft: draft.transcription,
      published: published.transcription,
      hasChanged: draft.transcription !== published.transcription,
    },
  ]

  return {
    hasChanges: fieldDiffs.some((f) => f.hasChanged),
    changedFields: fieldDiffs.filter((f) => f.hasChanged).map((f) => f.field),
    fieldDiffs,
    publishedAt: published.publishedAt,
  }
}
