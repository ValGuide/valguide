import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { tour, tourStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopVisibilityInput = {
  tourNanoId: string
  stopNanoId: string
  visible: boolean
}

export type UpdateStopVisibilityResult = {
  tourNanoId: string
  stopNanoId: string
  visible: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateStopVisibility(input: UpdateStopVisibilityInput): Promise<UpdateStopVisibilityResult> {
  const { tourNanoId, stopNanoId, visible } = input

  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [existing] = await db
    .select({ id: tourStopDraft.id })
    .from(tourStopDraft)
    .where(and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, foundStop.id)))
    .limit(1)

  if (!existing) {
    throw new NotFoundError('Stop not found in guide')
  }

  await db
    .update(tourStopDraft)
    .set({ visible })
    .where(and(eq(tourStopDraft.tourId, foundTour.id), eq(tourStopDraft.stopId, foundStop.id)))

  return { tourNanoId, stopNanoId, visible }
}
