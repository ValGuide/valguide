import { and, eq, like, or } from 'drizzle-orm'
import { generateSlug, RESERVED_SLUGS } from '../../../../utils/slug'
import type { DB } from '../../../db'
import { tour, tourSlug } from '../../schema'

/**
 * Generate a unique tour slug from a title, scoped to an organization.
 * If the slug is taken or reserved, appends -2, -3, etc. until unique.
 */
export async function generateUniqueTourSlug(
  db: DB,
  organizationId: string,
  title: string | undefined,
  nanoId: string,
): Promise<string> {
  const baseSlug = title ? generateSlug(title) : `tour-${nanoId}`
  const slug = baseSlug.length < 3 ? `${baseSlug}-tour` : baseSlug

  // Check both canonical slugs on tours AND redirect table for conflicts (scoped to org)
  const [canonicalSlugs, redirectSlugs] = await Promise.all([
    db
      .select({ slug: tour.slug })
      .from(tour)
      .where(and(eq(tour.organizationId, organizationId), or(eq(tour.slug, slug), like(tour.slug, `${slug}-%`)))),
    db
      .select({ slug: tourSlug.slug })
      .from(tourSlug)
      .where(
        and(eq(tourSlug.organizationId, organizationId), or(eq(tourSlug.slug, slug), like(tourSlug.slug, `${slug}-%`))),
      ),
  ])

  const allTaken = [...canonicalSlugs, ...redirectSlugs].map((r) => r.slug)
  return pickUniqueTourSlug(slug, allTaken)
}

/**
 * Given a desired slug and a list of already-taken slugs,
 * return the first available slug (appending -2, -3, etc. if needed).
 */
export function pickUniqueTourSlug(slug: string, takenSlugs: string[]): string {
  const isReserved = (s: string) => RESERVED_SLUGS.includes(s as (typeof RESERVED_SLUGS)[number])

  if (!takenSlugs.includes(slug) && !isReserved(slug)) {
    return slug
  }

  const suffixPattern = new RegExp(`^${slug}(?:-(\\d+))?$`)
  const maxSuffix = takenSlugs
    .map((s) => s.match(suffixPattern))
    .filter(Boolean)
    .map((m) => (m![1] ? Number.parseInt(m![1], 10) : 1))
    .reduce((max, n) => Math.max(max, n), 0)

  return `${slug}-${maxSuffix + 1}`
}
