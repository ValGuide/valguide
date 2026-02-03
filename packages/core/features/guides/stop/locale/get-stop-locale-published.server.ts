import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale } from '../../schema'

export type StopLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  publishedAt: Date
}

export async function getStopLocalePublished(
  stopNanoId: string,
  locale: string,
): Promise<StopLocalePublishedResult | null> {
  const [row] = await db
    .select({
      locale: stopLocale.locale,
      title: stopLocale.title,
      description: stopLocale.description,
      transcription: stopLocale.transcription,
      publishedAt: stopLocale.publishedAt,
    })
    .from(stop)
    .innerJoin(stopLocale, eq(stopLocale.stopId, stop.id))
    .where(and(eq(stop.nanoId, stopNanoId), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    transcription: row.transcription,
    publishedAt: row.publishedAt,
  }
}
