import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, stop, stopLocale, stopLocaleDraft } from '../../schema'
import type { StopLocaleDraftResult } from './get-stop-locale-draft.server'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get or create a stop locale draft for a stop within a guide context.
 * Validates that the locale is in the guide's availableLocales.
 * Auto-creates stopLocale + stopLocaleDraft if missing.
 */
export async function getOrCreateStopLocaleDraftForGuide(
  guideNanoId: string,
  stopNanoId: string,
  locale: string,
): Promise<StopLocaleDraftResult | null> {
  // Fetch guide and validate locale is in availableLocales
  const [foundGuide] = await db
    .select({ id: guide.id, availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) return null
  if (!foundGuide.availableLocales.includes(locale)) return null

  // Fetch stop
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) return null

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

  // Auto-create missing locale + draft (like guide pattern)
  if (!row) {
    const [newLocale] = await db
      .insert(stopLocale)
      .values({ stopId: foundStop.id, locale })
      .returning({ id: stopLocale.id })
    await db.insert(stopLocaleDraft).values({ stopLocaleId: newLocale.id })
    // Return empty draft values
    return {
      locale,
      title: null,
      description: null,
      transcription: null,
      revision: 0,
      hasUnpublishedChanges: true,
      publishedVersionId: null,
    }
  }

  // Auto-create missing draft if locale exists but draft was deleted
  if (row.revision === null) {
    await db.insert(stopLocaleDraft).values({ stopLocaleId: row.localeId })
    return {
      locale,
      title: null,
      description: null,
      transcription: null,
      revision: 0,
      hasUnpublishedChanges: true,
      publishedVersionId: row.publishedVersionId,
    }
  }

  return {
    locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    revision: row.revision,
    hasUnpublishedChanges: row.publishedVersionId === null || row.revision !== row.lastPublishedDraftRevision,
    publishedVersionId: row.publishedVersionId,
  }
}
