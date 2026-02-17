import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { tour } from '../tours/schema'
import type { ShortLink } from './schema'

/**
 * Resolves a short link to its app path using slug-based URLs.
 * This is the ONLY place URL patterns are defined.
 *
 * @returns The path (relative or absolute for external), or null if type is unknown
 */
export async function buildPathFromShortLink(link: ShortLink): Promise<string | null> {
  switch (link.type) {
    case 'tour': {
      if (!link.tourNanoId || !link.locale) return null
      const slugs = await resolveTourSlugs(link.tourNanoId)
      if (!slugs) return null
      return `/${slugs.orgSlug}/${slugs.tourSlug}`
    }

    case 'stop': {
      if (!link.tourNanoId || !link.stopNanoId || !link.locale) return null
      const slugs = await resolveTourSlugs(link.tourNanoId)
      if (!slugs) return null
      return `/${slugs.orgSlug}/${slugs.tourSlug}/${link.stopNanoId}`
    }

    case 'campaign':
      if (!link.campaignId) return null
      return `/campaigns/${link.campaignId}`

    case 'landing_page':
      if (!link.pageSlug || !link.locale) return null
      return `/${link.locale}/${link.pageSlug}`

    case 'external':
      return link.externalUrl ?? null

    default:
      return null
  }
}

/**
 * Resolves a tour nanoId to its org slug and tour slug.
 */
async function resolveTourSlugs(tourNanoId: string): Promise<{ orgSlug: string; tourSlug: string } | null> {
  const [foundTour] = await db
    .select({ id: tour.id, organizationId: tour.organizationId, slug: tour.slug })
    .from(tour)
    .where(and(eq(tour.nanoId, tourNanoId), isNull(tour.deletedAt)))
    .limit(1)

  if (!foundTour) return null

  const [orgRow] = await db
    .select({ slug: organization.slug })
    .from(organization)
    .where(eq(organization.id, foundTour.organizationId))
    .limit(1)

  if (!orgRow) return null

  return { orgSlug: orgRow.slug, tourSlug: foundTour.slug }
}

/**
 * Checks if a path is an absolute URL (external link)
 */
export function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path)
}
