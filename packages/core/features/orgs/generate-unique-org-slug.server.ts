import { eq, like, or } from 'drizzle-orm'
import { generateSlug, RESERVED_SLUGS } from '../../utils/slug'
import type { DB } from '../db'
import { organization, organizationSlug } from './schema'

/**
 * Generate a unique org slug from an org name.
 * If the slug is taken or reserved, appends -2, -3, etc. until unique.
 * Checks both canonical slugs on orgs AND redirect table for conflicts.
 */
export async function generateUniqueOrgSlug(db: DB, orgName: string): Promise<string> {
  const baseSlug = generateSlug(orgName)

  // Ensure base slug is valid (at least 3 chars)
  const slug = baseSlug.length < 3 ? `${baseSlug}-studio` : baseSlug

  // Check both canonical slugs on orgs AND redirect table for conflicts
  const [canonicalSlugs, redirectSlugs] = await Promise.all([
    db
      .select({ slug: organization.slug })
      .from(organization)
      .where(or(eq(organization.slug, slug), like(organization.slug, `${slug}-%`))),
    db
      .select({ slug: organizationSlug.slug })
      .from(organizationSlug)
      .where(or(eq(organizationSlug.slug, slug), like(organizationSlug.slug, `${slug}-%`))),
  ])

  const allTaken = [...canonicalSlugs, ...redirectSlugs].map((r) => r.slug)
  return pickUniqueSlug(slug, allTaken)
}

/**
 * Given a desired slug and a list of already-taken slugs,
 * return the first available slug (appending -2, -3, etc. if needed).
 */
export function pickUniqueSlug(slug: string, takenSlugs: string[]): string {
  const isReserved = (s: string) => RESERVED_SLUGS.includes(s as (typeof RESERVED_SLUGS)[number])

  if (!takenSlugs.includes(slug) && !isReserved(slug)) {
    return slug
  }

  // Extract numeric suffixes from taken slugs (e.g. "my-org-3" → 3, "my-org" → 1)
  const suffixPattern = new RegExp(`^${slug}(?:-(\\d+))?$`)
  const maxSuffix = takenSlugs
    .map((s) => s.match(suffixPattern))
    .filter(Boolean)
    .map((m) => (m![1] ? Number.parseInt(m![1], 10) : 1))
    .reduce((max, n) => Math.max(max, n), 0)

  return `${slug}-${maxSuffix + 1}`
}
