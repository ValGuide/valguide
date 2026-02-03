import { eq } from 'drizzle-orm'
import { db } from '../db'
import type { ShortLink } from './schema'
import { short_links } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetTourShortLinksResult = ShortLink[]

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get all short links for a tour (any type - tour or stop level).
 */
export async function getShortLinksForTour(tourNanoId: string): Promise<ShortLink[]> {
  return db.query.short_links.findMany({
    where: eq(short_links.tourNanoId, tourNanoId),
  })
}
