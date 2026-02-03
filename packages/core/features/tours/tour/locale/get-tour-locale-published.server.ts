import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tour, tourLocale } from '../../schema'

export type TourLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  publishedAt: Date
}

export async function getTourLocalePublished(
  tourNanoId: string,
  locale: string,
): Promise<TourLocalePublishedResult | null> {
  const [row] = await db
    .select({
      locale: tourLocale.locale,
      title: tourLocale.title,
      description: tourLocale.description,
      publishedAt: tourLocale.publishedAt,
    })
    .from(tour)
    .innerJoin(tourLocale, eq(tourLocale.tourId, tour.id))
    .where(and(eq(tour.nanoId, tourNanoId), eq(tourLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt,
  }
}
