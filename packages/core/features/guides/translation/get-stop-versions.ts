import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleVersion } from '../schema'

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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getStopVersionsSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getStopVersionsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopVersionsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await getStopVersions(data.nanoId, data.locale)
    if (!result) {
      throw new NotFoundError('Stop locale')
    }

    return result
  })
