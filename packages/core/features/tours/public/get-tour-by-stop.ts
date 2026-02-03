/**
 * Get the tour ID that contains a stop by the stop's nanoId.
 * Used by the consumer-facing app for navigation between stops and tours.
 */

import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { tour, tourStop, stop } from '../schema'

// ============================================================================
// Query Function
// ============================================================================

/**
 * Get the tour nanoId that contains a stop by the stop's nanoId.
 * Returns null if the stop is not part of any published tour.
 */
export async function getTourIdByStopNanoId(stopNanoId: string): Promise<string | null> {
  const stopRow = await db.query.stop.findFirst({
    where: and(eq(stop.nanoId, stopNanoId), isNull(stop.deletedAt)),
  })

  if (!stopRow) return null

  // Find the tour that contains this stop in its published structure
  const tourStopRow = await db.query.tourStop.findFirst({
    where: eq(tourStop.stopId, stopRow.id),
  })

  if (!tourStopRow) return null

  // Get the tour nanoId
  const tourRow = await db.query.tour.findFirst({
    where: eq(tour.id, tourStopRow.tourId),
  })

  return tourRow?.nanoId ?? null
}
