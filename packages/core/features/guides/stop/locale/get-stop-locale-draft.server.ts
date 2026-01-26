import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  revision: number
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopLocaleDraft(stopNanoId: string, locale: string): Promise<StopLocaleDraftResult | null> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) return null

  const [row] = await db
    .select({
      locale: stopLocale.locale,
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
      revision: stopLocaleDraft.revision,
      publishedVersionId: stopLocale.publishedVersionId,
      lastPublishedDraftRevision: stopLocale.lastPublishedDraftRevision,
    })
    .from(stopLocale)
    .innerJoin(stopLocaleDraft, eq(stopLocaleDraft.id, stopLocale.draftId))
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    revision: row.revision,
    hasUnpublishedChanges: row.publishedVersionId === null || row.revision !== row.lastPublishedDraftRevision,
    publishedVersionId: row.publishedVersionId,
  }
}
