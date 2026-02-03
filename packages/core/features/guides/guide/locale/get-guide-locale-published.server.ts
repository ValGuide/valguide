import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale } from '../../schema'

export type GuideLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  publishedAt: Date
}

export async function getGuideLocalePublished(
  guideNanoId: string,
  locale: string,
): Promise<GuideLocalePublishedResult | null> {
  const [row] = await db
    .select({
      locale: guideLocale.locale,
      title: guideLocale.title,
      description: guideLocale.description,
      publishedAt: guideLocale.publishedAt,
    })
    .from(guide)
    .innerJoin(guideLocale, eq(guideLocale.guideId, guide.id))
    .where(and(eq(guide.nanoId, guideNanoId), eq(guideLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt,
  }
}
