import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleVersion } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  version: number
  publishedAt: Date | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopLocalePublished(
  stopNanoId: string,
  locale: string,
): Promise<StopLocalePublishedResult | null> {
  const [row] = await db
    .select({
      locale: stopLocale.locale,
      title: stopLocaleVersion.title,
      description: stopLocaleVersion.description,
      transcription: stopLocaleVersion.transcription,
      version: stopLocaleVersion.version,
      publishedAt: stopLocaleVersion.publishedAt,
    })
    .from(stop)
    .innerJoin(stopLocale, eq(stopLocale.stopId, stop.id))
    .innerJoin(stopLocaleVersion, eq(stopLocaleVersion.id, stopLocale.publishedVersionId))
    .where(and(eq(stop.nanoId, stopNanoId), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    version: row.version,
    publishedAt: row.publishedAt,
  }
}
