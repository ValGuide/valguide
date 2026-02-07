import { eq, or } from 'drizzle-orm'
import type { DB } from '../db'
import { organization, organizationSlug } from './schema'

export type ResolvedOrg =
  | {
      found: true
      organizationId: string
      nanoId: string
      matchedBy: 'nanoId' | 'slug'
      matchedSlug: string | null
      primarySlug: string | null
      needsRedirect: boolean
    }
  | {
      found: false
    }

/**
 * Resolve an organization by either nanoId or slug.
 * Returns the org details plus redirect information.
 *
 * Resolution priority:
 * 1. Check if input matches org.nanoId → needsRedirect: true (redirect to slug URL)
 * 2. Check if input matches a slug → if not primary, needsRedirect: true
 * 3. If primary slug match → needsRedirect: false (serve page)
 */
export async function resolveOrgByIdOrSlug(db: DB, idOrSlug: string): Promise<ResolvedOrg> {
  // Single query: join org with slug table, check both nanoId and slug
  const results = await db
    .select({
      orgId: organization.id,
      orgNanoId: organization.nanoId,
      slugId: organizationSlug.id,
      slug: organizationSlug.slug,
      isPrimary: organizationSlug.isPrimary,
    })
    .from(organization)
    .leftJoin(organizationSlug, eq(organizationSlug.organizationId, organization.id))
    .where(or(eq(organization.nanoId, idOrSlug), eq(organizationSlug.slug, idOrSlug)))

  if (results.length === 0) {
    return { found: false }
  }

  // Group results by org (should only be one org, but may have multiple slug rows)
  const orgId = results[0].orgId
  const orgNanoId = results[0].orgNanoId

  // Find how we matched
  const matchedByNanoId = orgNanoId === idOrSlug
  const matchedSlugRow = results.find((r) => r.slug === idOrSlug)
  const primarySlugRow = results.find((r) => r.isPrimary === true)

  const primarySlug = primarySlugRow?.slug ?? null
  const matchedSlug = matchedSlugRow?.slug ?? null

  // Determine if redirect is needed
  let needsRedirect = false

  if (matchedByNanoId) {
    // Accessed via nanoId → redirect to primary slug (if exists)
    needsRedirect = primarySlug !== null
  } else if (matchedSlug && !matchedSlugRow?.isPrimary) {
    // Accessed via old slug → redirect to primary
    needsRedirect = true
  }

  return {
    found: true,
    organizationId: orgId,
    nanoId: orgNanoId,
    matchedBy: matchedByNanoId ? 'nanoId' : 'slug',
    matchedSlug,
    primarySlug,
    needsRedirect,
  }
}
