import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, stop, stopLocale, stopLocaleDraft } from '../../schema'

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
 * Ensures all guide's availableLocales have stopLocale + stopLocaleDraft records.
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

  // Fetch existing stopLocale records for this stop
  const existingLocales = await db
    .select({ locale: stopLocale.locale })
    .from(stopLocale)
    .where(eq(stopLocale.stopId, foundStop.id))

  const existingLocaleSet = new Set(existingLocales.map((l) => l.locale))

  // Find missing locales
  const missingLocales = guideLocales.filter((locale) => !existingLocaleSet.has(locale))

  if (missingLocales.length === 0) {
    return { createdLocales: [] }
  }

  // Create missing stopLocale records
  const newLocales = await db
    .insert(stopLocale)
    .values(missingLocales.map((locale) => ({ stopId: foundStop.id, locale })))
    .returning({ id: stopLocale.id, locale: stopLocale.locale })

  // Create stopLocaleDraft for each new locale
  await db.insert(stopLocaleDraft).values(newLocales.map((l) => ({ stopLocaleId: l.id })))

  return { createdLocales: newLocales.map((l) => l.locale) }
}
