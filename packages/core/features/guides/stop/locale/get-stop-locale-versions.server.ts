import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleVersion } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopLocaleVersionInfo = {
  id: string
  version: number
  title: string | null
  description: string | null
  transcription: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
  isCurrent: boolean
}

export type GetStopVersionsResult = {
  locale: string
  currentVersionId: string | null
  versions: StopLocaleVersionInfo[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopVersions(stopNanoId: string, locale: string): Promise<GetStopVersionsResult | null> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) return null

  const [localeRow] = await db
    .select({
      id: stopLocale.id,
      locale: stopLocale.locale,
      publishedVersionId: stopLocale.publishedVersionId,
    })
    .from(stopLocale)
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!localeRow) return null

  const versions = await db
    .select({
      id: stopLocaleVersion.id,
      version: stopLocaleVersion.version,
      title: stopLocaleVersion.title,
      description: stopLocaleVersion.description,
      transcription: stopLocaleVersion.transcription,
      createdAt: stopLocaleVersion.createdAt,
      createdBy: stopLocaleVersion.createdBy,
      publishedAt: stopLocaleVersion.publishedAt,
    })
    .from(stopLocaleVersion)
    .where(eq(stopLocaleVersion.stopLocaleId, localeRow.id))
    .orderBy(desc(stopLocaleVersion.version))

  return {
    locale: localeRow.locale,
    currentVersionId: localeRow.publishedVersionId,
    versions: versions.map((v) => ({
      ...v,
      isCurrent: v.id === localeRow.publishedVersionId,
    })),
  }
}
