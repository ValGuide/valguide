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
  const [foundStop] = await db
    .select({ id: stop.id, availableLocales: stop.availableLocales })
    .from(stop)
    .where(eq(stop.nanoId, stopNanoId))
    .limit(1)

  if (!foundStop) return null

  // Check if locale is in availableLocales
  if (!foundStop.availableLocales.includes(locale)) return null

  // Try to get locale with its draft
  const [row] = await db
    .select({
      localeId: stopLocale.id,
      locale: stopLocale.locale,
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
      revision: stopLocaleDraft.revision,
      publishedVersionId: stopLocale.publishedVersionId,
      lastPublishedDraftRevision: stopLocale.lastPublishedDraftRevision,
    })
    .from(stopLocale)
    .leftJoin(stopLocaleDraft, eq(stopLocaleDraft.stopLocaleId, stopLocale.id))
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  // Auto-create missing locale + draft
  if (!row) {
    const [newLocale] = await db
      .insert(stopLocale)
      .values({ stopId: foundStop.id, locale })
      .returning({ id: stopLocale.id })
    await db.insert(stopLocaleDraft).values({ stopLocaleId: newLocale.id })
  } else if (row.revision === null) {
    // Auto-create missing draft if locale exists but draft was deleted
    await db.insert(stopLocaleDraft).values({ stopLocaleId: row.localeId })
  }

  const title = row?.title ?? null
  const description = row?.description ?? null
  const transcription = row?.transcription ?? null
  const revision = row?.revision ?? 0
  const publishedVersionId = row?.publishedVersionId ?? null
  const lastPublishedDraftRevision = row?.lastPublishedDraftRevision ?? null

  return {
    locale,
    title,
    description,
    transcription,
    revision,
    hasUnpublishedChanges: publishedVersionId === null || revision !== lastPublishedDraftRevision,
    publishedVersionId,
  }
}
