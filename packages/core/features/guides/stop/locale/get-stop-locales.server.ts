import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { stop, stopLocale } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopExistingLocales = string[]

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get the list of locales that have stopLocale records for a stop.
 * These are the locales that have been created (not necessarily with content).
 */
export async function getStopLocales(nanoId: string): Promise<StopExistingLocales> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, nanoId)).limit(1)

  if (!foundStop) return []

  const localeRows = await db
    .select({ locale: stopLocale.locale })
    .from(stopLocale)
    .where(eq(stopLocale.stopId, foundStop.id))

  return localeRows.map((r) => r.locale)
}
