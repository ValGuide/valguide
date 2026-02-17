import { and, eq, isNull, or } from 'drizzle-orm'
import type { DB } from '../../../db'
import { organization } from '../../../orgs/schema'
import { tour, tourSlug } from '../../schema'

export type ResolvedTour =
  | {
      found: true
      tourId: string
      tourNanoId: string
      organizationId: string
      orgNanoId: string
      orgPrimarySlug: string | null
      matchedBy: 'nanoId' | 'slug'
      matchedSlug: string | null
      primarySlug: string | null
      needsRedirect: boolean
    }
  | {
      found: false
    }

export async function resolveTourByIdOrSlug(db: DB, orgId: string, idOrSlug: string): Promise<ResolvedTour> {
  // Get org details
  const orgData = await db
    .select({
      orgId: organization.id,
      orgNanoId: organization.nanoId,
      orgSlug: organization.slug,
    })
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1)

  if (orgData.length === 0) {
    return { found: false }
  }

  const orgNanoId = orgData[0].orgNanoId
  const orgPrimarySlug = orgData[0].orgSlug

  // Try canonical: nanoId or slug on tour table
  const foundTour = await db.query.tour.findFirst({
    where: and(
      eq(tour.organizationId, orgId),
      isNull(tour.deletedAt),
      isNull(tour.archivedAt),
      or(eq(tour.nanoId, idOrSlug), eq(tour.slug, idOrSlug)),
    ),
    columns: { id: true, nanoId: true, slug: true },
  })

  if (foundTour) {
    const matchedByNanoId = foundTour.nanoId === idOrSlug
    return {
      found: true,
      tourId: foundTour.id,
      tourNanoId: foundTour.nanoId,
      organizationId: orgId,
      orgNanoId,
      orgPrimarySlug,
      matchedBy: matchedByNanoId ? 'nanoId' : 'slug',
      matchedSlug: matchedByNanoId ? null : foundTour.slug,
      primarySlug: foundTour.slug,
      needsRedirect: matchedByNanoId,
    }
  }

  // Fall back to redirect table
  const redirect = await db.query.tourSlug.findFirst({
    where: and(eq(tourSlug.organizationId, orgId), eq(tourSlug.slug, idOrSlug)),
    columns: { tourId: true },
  })

  if (!redirect) {
    return { found: false }
  }

  // Look up the tour for canonical slug
  const redirectedTour = await db.query.tour.findFirst({
    where: and(eq(tour.id, redirect.tourId), isNull(tour.deletedAt), isNull(tour.archivedAt)),
    columns: { id: true, nanoId: true, slug: true },
  })

  if (!redirectedTour) {
    return { found: false }
  }

  return {
    found: true,
    tourId: redirectedTour.id,
    tourNanoId: redirectedTour.nanoId,
    organizationId: orgId,
    orgNanoId,
    orgPrimarySlug,
    matchedBy: 'slug',
    matchedSlug: idOrSlug,
    primarySlug: redirectedTour.slug,
    needsRedirect: true,
  }
}
