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
  hasPublished: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopLocaleDraft(stopNanoId: string, locale: string): Promise<StopLocaleDraftResult | null> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) return null

  // Query stopLocaleDraft directly by stopId + locale
  const [draft] = await db
    .select({
      locale: stopLocaleDraft.locale,
      title: stopLocaleDraft.title,
      description: stopLocaleDraft.description,
      transcription: stopLocaleDraft.transcription,
    })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, foundStop.id), eq(stopLocaleDraft.locale, locale)))
    .limit(1)

  if (!draft) {
    await db.insert(stopLocaleDraft).values({ stopId: foundStop.id, locale })

    return {
      locale,
      title: null,
      description: null,
      transcription: null,
      hasPublished: false,
    }
  }

  // Check if published version exists by querying stopLocale
  const [published] = await db
    .select({ id: stopLocale.id })
    .from(stopLocale)
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  return {
    locale: draft.locale,
    title: draft.title,
    description: draft.description,
    transcription: draft.transcription,
    hasPublished: !!published,
  }
}
