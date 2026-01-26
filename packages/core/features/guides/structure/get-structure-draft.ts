import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideStopDraft, stop, stopLocale, stopLocaleDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StructureDraftStop = {
  stopId: string
  stopNanoId: string
  position: number
  visible: boolean
  title: string | null
  locale: string
}

export type StructureDraftResult = {
  guideNanoId: string
  stops: StructureDraftStop[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStructureDraft(guideNanoId: string, locale: string): Promise<StructureDraftResult | null> {
  const [foundGuide] = await db
    .select({ id: guide.id, nanoId: guide.nanoId })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) return null

  const rows = await db
    .select({
      stopId: guideStopDraft.stopId,
      stopNanoId: stop.nanoId,
      position: guideStopDraft.position,
      visible: guideStopDraft.visible,
      title: stopLocaleDraft.title,
      locale: stopLocale.locale,
    })
    .from(guideStopDraft)
    .innerJoin(stop, eq(stop.id, guideStopDraft.stopId))
    .innerJoin(stopLocale, eq(stopLocale.stopId, stop.id))
    .innerJoin(stopLocaleDraft, eq(stopLocaleDraft.id, stopLocale.draftId))
    .where(eq(guideStopDraft.guideId, foundGuide.id))
    .orderBy(asc(guideStopDraft.position))

  // Filter to requested locale, fallback to first available
  const stopsByStopId = new Map<string, StructureDraftStop>()
  for (const row of rows) {
    const existing = stopsByStopId.get(row.stopId)
    if (!existing || row.locale === locale) {
      stopsByStopId.set(row.stopId, {
        stopId: row.stopId,
        stopNanoId: row.stopNanoId,
        position: row.position,
        visible: row.visible,
        title: row.title,
        locale: row.locale,
      })
    }
  }

  // Sort by position
  const stops = Array.from(stopsByStopId.values()).sort((a, b) => a.position - b.position)

  return { guideNanoId: foundGuide.nanoId, stops }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getStructureDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string().default('en'),
})

export const getStructureDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStructureDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const result = await getStructureDraft(data.nanoId, data.locale)
    if (!result) {
      throw new NotFoundError('Guide')
    }

    return result
  })
