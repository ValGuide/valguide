import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourSettingsDraft } from '../../schema'

export type UpdateTourSettingsDraftInput = {
  themeId?: string | null
  settingsJson?: string | null
}

export type UpdateTourSettingsDraftResult = {
  id: string
  updatedAt: Date
}

export async function updateTourSettingsDraft(
  tourNanoId: string,
  input: UpdateTourSettingsDraftInput,
  userId: string,
): Promise<UpdateTourSettingsDraftResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const [updated] = await db
    .update(tourSettingsDraft)
    .set({
      themeId: input.themeId,
      settingsJson: input.settingsJson,
      updatedBy: userId,
    })
    .where(eq(tourSettingsDraft.tourId, foundTour.id))
    .returning({
      id: tourSettingsDraft.id,
      updatedAt: tourSettingsDraft.updatedAt,
    })

  if (!updated) {
    throw new NotFoundError('Tour settings draft')
  }

  return updated
}
