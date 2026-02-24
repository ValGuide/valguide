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
 * Resolves a tour nanoId to its org slug and tour slug via a single join query.
 */
async function resolveTourSlugs(tourNanoId: string): Promise<{ orgSlug: string; tourSlug: string } | null> {
  const [result] = await db
    .select({ orgSlug: organization.slug, tourSlug: tour.slug })
    .from(tour)
    .innerJoin(organization, eq(tour.organizationId, organization.id))
    .where(and(eq(tour.nanoId, tourNanoId), isNull(tour.deletedAt)))
    .limit(1)

  return result ?? null
}

/**
 * Checks if a path is an absolute URL (external link)
 */
export function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path)
}
