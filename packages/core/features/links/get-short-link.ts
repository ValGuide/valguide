import { eq } from 'drizzle-orm'
import { db } from '../db'
import type { ShortLink } from './schema'
import { short_links } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetShortLinkByCodeResult = ShortLink | null

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get a short link by its code (for resolution in links app).
 */
export async function getShortLinkByCode(code: string): Promise<ShortLink | null> {
  const result = await db.query.short_links.findFirst({
    where: eq(short_links.code, code),
  })
  return result ?? null
}
