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
 * 1. Check if input matches org.nanoId or org.slug → canonical match
 * 2. Fall back to redirect table for old slugs → needsRedirect: true
 */
export async function resolveOrgByIdOrSlug(db: DB, idOrSlug: string): Promise<ResolvedOrg> {
  // Try canonical: nanoId or slug on organization table
  const org = await db.query.organization.findFirst({
    where: or(eq(organization.nanoId, idOrSlug), eq(organization.slug, idOrSlug)),
    columns: { id: true, nanoId: true, slug: true },
  })

  if (org) {
    const matchedByNanoId = org.nanoId === idOrSlug
    return {
      found: true,
      organizationId: org.id,
      nanoId: org.nanoId,
      matchedBy: matchedByNanoId ? 'nanoId' : 'slug',
      matchedSlug: matchedByNanoId ? null : org.slug,
      primarySlug: org.slug,
      needsRedirect: matchedByNanoId, // nanoId access → redirect to slug URL
    }
  }

  // Fall back to redirect table
  const redirect = await db.query.organizationSlug.findFirst({
    where: eq(organizationSlug.slug, idOrSlug),
    columns: { organizationId: true },
  })

  if (!redirect) {
    return { found: false }
  }

  // Look up the org to get canonical slug
  const redirectedOrg = await db.query.organization.findFirst({
    where: eq(organization.id, redirect.organizationId),
    columns: { id: true, nanoId: true, slug: true },
  })

  if (!redirectedOrg) {
    return { found: false }
  }

  return {
    found: true,
    organizationId: redirectedOrg.id,
    nanoId: redirectedOrg.nanoId,
    matchedBy: 'slug',
    matchedSlug: idOrSlug,
    primarySlug: redirectedOrg.slug,
    needsRedirect: true, // Old slug → redirect to canonical
  }
}
