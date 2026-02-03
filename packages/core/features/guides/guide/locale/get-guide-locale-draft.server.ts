import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideLocaleDraft(guideNanoId: string, locale: string): Promise<GuideLocaleDraftResult | null> {
  const [foundGuide] = await db
    .select({ id: guide.id, availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) return null

  if (!foundGuide.availableLocales.includes(locale)) return null

  const [row] = await db
    .select({
      locale: guideLocaleDraft.locale,
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
      publishedLocaleId: guideLocale.id,
    })
    .from(guideLocaleDraft)
    .leftJoin(
      guideLocale,
      and(eq(guideLocale.guideId, guideLocaleDraft.guideId), eq(guideLocale.locale, guideLocaleDraft.locale)),
    )
    .where(and(eq(guideLocaleDraft.guideId, foundGuide.id), eq(guideLocaleDraft.locale, locale)))
    .limit(1)

  if (!row) {
    await db.insert(guideLocaleDraft).values({ guideId: foundGuide.id, locale })
    return {
      locale,
      title: null,
      description: null,
      hasPublished: false,
    }
  }

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    hasPublished: row.publishedLocaleId !== null,
  }
}
