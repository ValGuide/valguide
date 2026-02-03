import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tour, tourLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureAllTourLocalesResult = {
  createdLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensures all guide's availableLocales have tourLocaleDraft records.
 * Creates missing draft records for any locales that don't exist yet.
 */
export async function ensureAllTourLocales(tourNanoId: string): Promise<EnsureAllTourLocalesResult> {
  const [foundTour] = await db
    .select({ id: tour.id, availableLocales: tour.availableLocales })
    .from(tour)
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!foundTour) {
    return { createdLocales: [] }
  }

  const tourLocales = foundTour.availableLocales

  const existingDrafts = await db
    .select({ locale: tourLocaleDraft.locale })
    .from(tourLocaleDraft)
    .where(eq(tourLocaleDraft.tourId, foundTour.id))

  const existingLocaleSet = new Set(existingDrafts.map((l) => l.locale))

  const missingLocales = tourLocales.filter((locale) => !existingLocaleSet.has(locale))

  if (missingLocales.length === 0) {
    return { createdLocales: [] }
  }

  await db.insert(tourLocaleDraft).values(missingLocales.map((locale) => ({ tourId: foundTour.id, locale })))

  return { createdLocales: missingLocales }
}
