import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourLocale } from '../../schema'

export type UnpublishTourLocaleResult = {
  success: boolean
  hasPublishedLocalesRemaining: boolean
}

export async function unpublishTourLocale(tourNanoId: string, locale: string): Promise<UnpublishTourLocaleResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const result = await db
    .delete(tourLocale)
    .where(and(eq(tourLocale.tourId, foundTour.id), eq(tourLocale.locale, locale)))
    .returning({ id: tourLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Tour locale')
  }

  const remaining = await db
    .select({ id: tourLocale.id })
    .from(tourLocale)
    .where(eq(tourLocale.tourId, foundTour.id))
    .limit(1)

  if (remaining.length === 0) {
    await db.update(tour).set({ publishedAt: null }).where(eq(tour.id, foundTour.id))
  }

  return { success: true, hasPublishedLocalesRemaining: remaining.length > 0 }
}
