import { and, eq, inArray } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop, tour, tourStopDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ReorderStopsInput = {
  tourNanoId: string
  stopNanoIds: string[]
}

export type ReorderStopsResult = {
  reordered: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function reorderStops(input: ReorderStopsInput): Promise<ReorderStopsResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, input.tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
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
        .update(tourStopDraft)
        .set({ position: i })
        .where(and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, stopId)))

      reordered++
    }

    return { reordered }
  })
}
