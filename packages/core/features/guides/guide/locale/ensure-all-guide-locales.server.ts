import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type EnsureAllGuideLocalesResult = {
  createdLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Ensures all guide's availableLocales have guideLocaleDraft records.
 * Creates missing draft records for any locales that don't exist yet.
 */
export async function ensureAllGuideLocales(guideNanoId: string): Promise<EnsureAllGuideLocalesResult> {
  const [foundGuide] = await db
    .select({ id: guide.id, availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) {
    return { createdLocales: [] }
  }

  const guideLocales = foundGuide.availableLocales

  const existingDrafts = await db
    .select({ locale: guideLocaleDraft.locale })
    .from(guideLocaleDraft)
    .where(eq(guideLocaleDraft.guideId, foundGuide.id))

  const existingLocaleSet = new Set(existingDrafts.map((l) => l.locale))

  const missingLocales = guideLocales.filter((locale) => !existingLocaleSet.has(locale))

  if (missingLocales.length === 0) {
    return { createdLocales: [] }
  }

  await db.insert(guideLocaleDraft).values(missingLocales.map((locale) => ({ guideId: foundGuide.id, locale })))

  return { createdLocales: missingLocales }
}
