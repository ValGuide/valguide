import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tour, tourLocale, tourLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type TourLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getTourLocaleDraft(tourNanoId: string, locale: string): Promise<TourLocaleDraftResult | null> {
  const [foundTour] = await db
    .select({ id: tour.id, availableLocales: tour.availableLocales, publishedAt: tour.publishedAt })
    .from(tour)
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!foundTour) return null

  if (!foundTour.availableLocales.includes(locale)) return null

  const [row] = await db
    .select({
      locale: tourLocaleDraft.locale,
      title: tourLocaleDraft.title,
      description: tourLocaleDraft.description,
      publishedLocaleId: tourLocale.id,
    })
    .from(tourLocaleDraft)
    .leftJoin(
      tourLocale,
      and(eq(tourLocale.tourId, tourLocaleDraft.tourId), eq(tourLocale.locale, tourLocaleDraft.locale)),
    )
    .where(and(eq(tourLocaleDraft.tourId, foundTour.id), eq(tourLocaleDraft.locale, locale)))
    .limit(1)

  if (!row) {
    await db.insert(tourLocaleDraft).values({ tourId: foundTour.id, locale })
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
    hasPublished: foundTour.publishedAt !== null && row.publishedLocaleId !== null,
  }
}
