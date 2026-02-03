import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourSettingsDraft } from '../../schema'

export type TourSettingsDraftResult = {
  id: string
  tourId: string
  themeId: string | null
  settingsJson: string | null
  updatedAt: Date
}

export async function getTourSettingsDraft(tourNanoId: string): Promise<TourSettingsDraftResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const [draft] = await db
    .select({
      id: tourSettingsDraft.id,
      tourId: tourSettingsDraft.tourId,
      themeId: tourSettingsDraft.themeId,
      settingsJson: tourSettingsDraft.settingsJson,
      updatedAt: tourSettingsDraft.updatedAt,
    })
    .from(tourSettingsDraft)
    .where(eq(tourSettingsDraft.tourId, foundTour.id))
    .limit(1)

  if (!draft) {
    throw new NotFoundError('Guide settings draft')
  }

  return draft
}
