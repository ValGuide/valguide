/**
 * Get the guide ID that contains a stop by the stop's nanoId.
 * Used by the consumer-facing app for navigation between stops and guides.
 */

import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideStop, stop } from '../schema'

// ============================================================================
// Query Function
// ============================================================================

/**
 * Get the guide nanoId that contains a stop by the stop's nanoId.
 * Returns null if the stop is not part of any published guide.
 */
export async function getGuideIdByStopNanoId(stopNanoId: string): Promise<string | null> {
  const stopRow = await db.query.stop.findFirst({
    where: and(eq(stop.nanoId, stopNanoId), isNull(stop.deletedAt)),
  })

  if (!stopRow) return null

  // Find the guide that contains this stop in its published structure
  const guideStopRow = await db.query.guideStop.findFirst({
    where: eq(guideStop.stopId, stopRow.id),
  })

  if (!guideStopRow) return null

  // Get the guide nanoId
  const guideRow = await db.query.guide.findFirst({
    where: eq(guide.id, guideStopRow.guideId),
  })

  return guideRow?.nanoId ?? null
}
