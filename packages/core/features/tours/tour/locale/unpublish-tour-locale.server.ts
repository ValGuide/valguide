import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourLocale } from '../../schema'

export type UnpublishTourLocaleResult = {
  success: boolean
}

export async function unpublishTourLocale(tourNanoId: string, locale: string): Promise<UnpublishTourLocaleResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const result = await db
    .delete(tourLocale)
    .where(and(eq(tourLocale.tourId, foundTour.id), eq(tourLocale.locale, locale)))
    .returning({ id: tourLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Guide locale')
  }

  return { success: true }
}
