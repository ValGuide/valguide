import { eq } from 'drizzle-orm'
import { db } from '../db'
import type { ShortLink } from './schema'
import { short_links } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetGuideShortLinksResult = ShortLink[]

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get all short links for a guide (any type - guide or stop level).
 */
export async function getShortLinksForGuide(guideNanoId: string): Promise<ShortLink[]> {
  return db.query.short_links.findMany({
    where: eq(short_links.guideNanoId, guideNanoId),
  })
}
