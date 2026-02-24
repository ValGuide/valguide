import { eq } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { organization } from '../../orgs/schema'
import { tour, tourLocale } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ArchiveTourResult = {
  nanoId: string
  archivedAt: Date
  publishedLocales: string[]
  tourSlug: string | null
  orgSlug: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function archiveTour(nanoId: string, userId: string): Promise<ArchiveTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  const publishedLocales = await db
    .select({ locale: tourLocale.locale })
    .from(tourLocale)
    .where(eq(tourLocale.tourId, tourId))

  const now = new Date()

  const [updated] = await db
    .update(tour)
    .set({
      archivedAt: now,
      updatedBy: userId,
    })
    .where(eq(tour.id, tourId))
    .returning({
      nanoId: tour.nanoId,
      archivedAt: tour.archivedAt,
      slug: tour.slug,
      organizationId: tour.organizationId,
    })

  if (!updated || !updated.archivedAt) {
    throw new NotFoundError('Tour')
  }

  const [org] = await db
    .select({ slug: organization.slug })
    .from(organization)
    .where(eq(organization.id, updated.organizationId))
    .limit(1)

  return {
    nanoId: updated.nanoId,
    archivedAt: updated.archivedAt,
    publishedLocales: publishedLocales.map((r) => r.locale),
    tourSlug: updated.slug,
    orgSlug: org?.slug ?? null,
  }
}
