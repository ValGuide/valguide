import { eq } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { tour, tourLocale } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteTourResult = {
  nanoId: string
  deletedAt: Date
  publishedLocales: string[]
  tourSlug: string | null
  orgSlug: string | null
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

async function getKvCleanupData(
  tourId: string,
): Promise<{ publishedLocales: string[]; tourSlug: string | null; orgSlug: string | null }> {
  const [tourWithOrg] = await db
    .select({ tourSlug: tour.slug, orgSlug: organization.slug })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .where(eq(tour.id, tourId))
    .limit(1)

  const publishedLocales = await db
    .select({ locale: tourLocale.locale })
    .from(tourLocale)
    .where(eq(tourLocale.tourId, tourId))

  return {
    publishedLocales: publishedLocales.map((r) => r.locale),
    tourSlug: tourWithOrg?.tourSlug ?? null,
    orgSlug: tourWithOrg?.orgSlug ?? null,
  }
}

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

export async function deleteTour(nanoId: string, userId: string): Promise<DeleteTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  const kvData = await getKvCleanupData(tourId)
  const now = new Date()

  const [updated] = await db
    .update(tour)
    .set({
      deletedAt: now,
      updatedBy: userId,
    })
    .where(eq(tour.id, tourId))
    .returning({ nanoId: tour.nanoId, deletedAt: tour.deletedAt })

  if (!updated || !updated.deletedAt) {
    throw new NotFoundError('Tour')
  }

  return {
    nanoId: updated.nanoId,
    deletedAt: updated.deletedAt,
    ...kvData,
  }
}

export async function permanentlyDeleteTour(nanoId: string, userId: string): Promise<DeleteTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  // Must gather KV data BEFORE cascade delete removes it
  const kvData = await getKvCleanupData(tourId)

  await db.delete(tour).where(eq(tour.id, tourId))

  return {
    nanoId,
    deletedAt: new Date(),
    ...kvData,
  }
}
