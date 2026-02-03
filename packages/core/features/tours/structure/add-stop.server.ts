import { and, eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop, tour, tourStopDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type AddStopToTourInput = {
  tourNanoId: string
  stopNanoId: string
  position?: number
}

export type AddStopToTourResult = {
  tourId: string
  stopId: string
  position: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function addStopToTour(input: AddStopToTourInput): Promise<AddStopToTourResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, input.tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, input.stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // Get max position for this tour
    const [{ max }] = await tx
      .select({ max: sql<number>`COALESCE(MAX(${tourStopDraft.position}), -1)` })
      .from(tourStopDraft)
      .where(eq(tourStopDraft.tourId, foundTour.id))

    const position = input.position ?? max + 1

    // If inserting at specific position, shift existing stops
    if (input.position !== undefined) {
      await tx
        .update(tourStopDraft)
        .set({ position: sql`${tourStopDraft.position} + 1` })
        .where(and(eq(tourStopDraft.tourId, foundTour.id), sql`${tourStopDraft.position} >= ${position}`))
    }

    // Insert new stop
    await tx
      .insert(tourStopDraft)
      .values({
        tourId: foundTour.id,
        stopId: foundStop.id,
        position,
        visible: true,
      })
      .onConflictDoNothing()

    return { tourId: foundTour.id, stopId: foundStop.id, position }
  })
}
