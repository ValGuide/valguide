import { and, eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { tour, tourStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RemoveStopFromTourInput = {
  tourNanoId: string
  stopNanoId: string
}

export type RemoveStopFromTourResult = {
  removed: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function removeStopFromTour(input: RemoveStopFromTourInput): Promise<RemoveStopFromTourResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, input.tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, input.stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // Get position of stop being removed
    const [existing] = await tx
      .select({ position: tourStopDraft.position })
      .from(tourStopDraft)
      .where(and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, foundStop.id)))
      .limit(1)

    if (!existing) {
      return { removed: false }
    }

    // Delete the stop from draft
    await tx
      .delete(tourStopDraft)
      .where(and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, foundStop.id)))

    // Shift positions down for stops after the removed one
    await tx
      .update(tourStopDraft)
      .set({ position: sql`${tourStopDraft.position} - 1` })
      .where(and(eq(tourStopDraft.tourId, foundTour.id), sql`${tourStopDraft.position} > ${existing.position}`))

    return { removed: true }
  })
}
