import { and, eq, inArray } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { guide, guideStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ReorderStopsInput = {
  guideNanoId: string
  stopNanoIds: string[]
}

export type ReorderStopsResult = {
  reordered: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function reorderStops(input: ReorderStopsInput): Promise<ReorderStopsResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, input.guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  if (input.stopNanoIds.length === 0) {
    return { reordered: 0 }
  }

  // Resolve nanoIds to UUIDs
  const stops = await db
    .select({ id: stop.id, nanoId: stop.nanoId })
    .from(stop)
    .where(inArray(stop.nanoId, input.stopNanoIds))

  const nanoIdToId = new Map(stops.map((s) => [s.nanoId, s.id]))

  return db.transaction(async (tx) => {
    let reordered = 0

    for (let i = 0; i < input.stopNanoIds.length; i++) {
      const stopId = nanoIdToId.get(input.stopNanoIds[i])
      if (!stopId) continue

      await tx
        .update(guideStopDraft)
        .set({ position: i })
        .where(and(eq(guideStopDraft.guideId, foundGuide.id), eq(guideStopDraft.stopId, stopId)))

      reordered++
    }

    return { reordered }
  })
}
