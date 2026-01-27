import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleVersion } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  version: number
  publishedAt: Date | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideLocalePublished(
  guideNanoId: string,
  locale: string,
): Promise<GuideLocalePublishedResult | null> {
  const [row] = await db
    .select({
      locale: guideLocale.locale,
      title: guideLocaleVersion.title,
      description: guideLocaleVersion.description,
      version: guideLocaleVersion.version,
      publishedAt: guideLocaleVersion.publishedAt,
    })
    .from(guide)
    .innerJoin(guideLocale, eq(guideLocale.guideId, guide.id))
    .innerJoin(guideLocaleVersion, eq(guideLocaleVersion.id, guideLocale.publishedVersionId))
    .where(and(eq(guide.nanoId, guideNanoId), eq(guideLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    version: row.version,
    publishedAt: row.publishedAt,
  }
}
