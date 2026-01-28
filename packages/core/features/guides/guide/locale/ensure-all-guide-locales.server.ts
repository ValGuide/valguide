import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleDraft } from '../../schema'

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
 * Ensures all guide's availableLocales have guideLocale + guideLocaleDraft records.
 * Creates missing records for any locales that don't exist yet.
 */
export async function ensureAllGuideLocales(guideNanoId: string): Promise<EnsureAllGuideLocalesResult> {
  // Fetch guide's availableLocales
  const [foundGuide] = await db
    .select({ id: guide.id, availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) {
    return { createdLocales: [] }
  }

  const guideLocales = foundGuide.availableLocales

  // Fetch existing guideLocale records for this guide
  const existingLocales = await db
    .select({ locale: guideLocale.locale })
    .from(guideLocale)
    .where(eq(guideLocale.guideId, foundGuide.id))

  const existingLocaleSet = new Set(existingLocales.map((l) => l.locale))

  // Find missing locales
  const missingLocales = guideLocales.filter((locale) => !existingLocaleSet.has(locale))

  if (missingLocales.length === 0) {
    return { createdLocales: [] }
  }

  // Create missing guideLocale records
  const newLocales = await db
    .insert(guideLocale)
    .values(missingLocales.map((locale) => ({ guideId: foundGuide.id, locale })))
    .returning({ id: guideLocale.id, locale: guideLocale.locale })

  // Create guideLocaleDraft for each new locale
  await db.insert(guideLocaleDraft).values(newLocales.map((l) => ({ guideLocaleId: l.id })))

  return { createdLocales: newLocales.map((l) => l.locale) }
}
