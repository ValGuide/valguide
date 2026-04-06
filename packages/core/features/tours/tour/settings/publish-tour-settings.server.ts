import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { organization } from '../../../orgs/schema'
import { tour } from '../../schema'
import { publishTourSettingsTx } from '../publish-tour.server'

export type PublishTourSettingsResult = {
  success: boolean
  nanoId: string
  orgSlug: string | null
  orgNanoId: string | null
}

export async function publishTourSettings(tourNanoId: string, userId: string): Promise<PublishTourSettingsResult> {
  const [foundTour] = await db
    .select({ id: tour.id, nanoId: tour.nanoId, organizationId: tour.organizationId })
    .from(tour)
    .where(eq(tour.nanoId, tourNanoId))
    .limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  await db.transaction(async (tx) => {
    await publishTourSettingsTx(tx, foundTour.id, userId)
  })

  const [org] = await db
    .select({ slug: organization.slug, nanoId: organization.nanoId })
    .from(organization)
    .where(eq(organization.id, foundTour.organizationId))
    .limit(1)

  return {
    success: true,
    nanoId: foundTour.nanoId,
    orgSlug: org?.slug ?? null,
    orgNanoId: org?.nanoId ?? null,
  }
}
