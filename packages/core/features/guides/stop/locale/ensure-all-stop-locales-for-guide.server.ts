import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, stop, stopLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureAllStopLocalesResult = {
  createdLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensures all guide's availableLocales have stopLocaleDraft records.
 * Creates missing records for any locales that don't exist yet.
 */
export async function ensureAllStopLocalesForGuide(
  guideNanoId: string,
  stopNanoId: string,
): Promise<EnsureAllStopLocalesResult> {
  // Fetch guide's availableLocales
  const [foundGuide] = await db
    .select({ availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) {
    return { createdLocales: [] }
  }

  // Fetch stop
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    return { createdLocales: [] }
  }

  const guideLocales = foundGuide.availableLocales

  // Fetch existing stopLocaleDraft records for this stop
  const existingLocales = await db
    .select({ locale: stopLocaleDraft.locale })
    .from(stopLocaleDraft)
    .where(eq(stopLocaleDraft.stopId, foundStop.id))

  const existingLocaleSet = new Set(existingLocales.map((l) => l.locale))

  // Find missing locales
  const missingLocales = guideLocales.filter((locale) => !existingLocaleSet.has(locale))

  if (missingLocales.length === 0) {
    return { createdLocales: [] }
  }

  // Create missing stopLocaleDraft records with stopId + locale
  await db.insert(stopLocaleDraft).values(missingLocales.map((locale) => ({ stopId: foundStop.id, locale })))

  return { createdLocales: missingLocales }
}
