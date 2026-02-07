import { and, eq, isNull, or } from 'drizzle-orm'
import type { DB } from '../../../db'
import { organization, organizationSlug } from '../../../orgs/schema'
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

/**
 * Resolve a tour by either nanoId or slug within an organization.
 *
 * @param orgId - The internal UUID of the organization (from prior org resolution)
 * @param idOrSlug - The tour identifier (nanoId or slug)
 */
export async function resolveTourByIdOrSlug(db: DB, orgId: string, idOrSlug: string): Promise<ResolvedTour> {
  // Get org details for redirect URL building
  const orgData = await db
    .select({
      orgId: organization.id,
      orgNanoId: organization.nanoId,
    })
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1)

  if (orgData.length === 0) {
    return { found: false }
  }

  const orgNanoId = orgData[0].orgNanoId

  // Get org's primary slug
  const orgSlugData = await db
    .select({ slug: organizationSlug.slug })
    .from(organizationSlug)
    .where(and(eq(organizationSlug.organizationId, orgId), eq(organizationSlug.isPrimary, true)))
    .limit(1)

  const orgPrimarySlug = orgSlugData[0]?.slug ?? null

  // Query tour with its slugs
  const results = await db
    .select({
      tourId: tour.id,
      tourNanoId: tour.nanoId,
      slugId: tourSlug.id,
      slug: tourSlug.slug,
      isPrimary: tourSlug.isPrimary,
    })
    .from(tour)
    .leftJoin(tourSlug, eq(tourSlug.tourId, tour.id))
    .where(
      and(
        eq(tour.organizationId, orgId),
        isNull(tour.deletedAt),
        isNull(tour.archivedAt),
        or(eq(tour.nanoId, idOrSlug), eq(tourSlug.slug, idOrSlug)),
      ),
    )

  if (results.length === 0) {
    return { found: false }
  }

  const tourId = results[0].tourId
  const tourNanoId = results[0].tourNanoId

  const matchedByNanoId = tourNanoId === idOrSlug
  const matchedSlugRow = results.find((r) => r.slug === idOrSlug)
  const primarySlugRow = results.find((r) => r.isPrimary === true)

  const primarySlug = primarySlugRow?.slug ?? null
  const matchedSlug = matchedSlugRow?.slug ?? null

  let needsRedirect = false

  if (matchedByNanoId) {
    needsRedirect = primarySlug !== null
  } else if (matchedSlug && !matchedSlugRow?.isPrimary) {
    needsRedirect = true
  }

  return {
    found: true,
    tourId,
    tourNanoId,
    organizationId: orgId,
    orgNanoId,
    orgPrimarySlug,
    matchedBy: matchedByNanoId ? 'nanoId' : 'slug',
    matchedSlug,
    primarySlug,
    needsRedirect,
  }
}
