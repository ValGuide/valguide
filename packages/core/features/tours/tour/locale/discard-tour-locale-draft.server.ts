import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourLocale, tourLocaleDraft } from '../../schema'

export async function discardTourLocaleDraft(tourNanoId: string, locale: string): Promise<void> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const [published] = await db
    .select({
      title: tourLocale.title,
      description: tourLocale.description,
    })
    .from(tourLocale)
    .where(and(eq(tourLocale.tourId, foundTour.id), eq(tourLocale.locale, locale)))
    .limit(1)

  if (!published) {
    throw new NotFoundError('Published tour locale')
  }

  const result = await db
    .update(tourLocaleDraft)
    .set({
      title: published.title,
      description: published.description,
    })
    .where(and(eq(tourLocaleDraft.tourId, foundTour.id), eq(tourLocaleDraft.locale, locale)))
    .returning({ id: tourLocaleDraft.id })

  if (result.length === 0) {
    throw new NotFoundError('Tour locale draft')
  }
}
