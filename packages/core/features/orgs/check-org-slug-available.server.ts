import { eq } from 'drizzle-orm'
import { RESERVED_SLUGS } from '../../utils/slug'
import type { DB } from '../db'
import { organization, organizationSlug } from './schema'

export type SlugAvailabilityResult = {
  available: boolean
  takenBy?: 'other' | 'self' | 'reserved' | 'nanoId'
}

export async function checkOrgSlugAvailable(
  db: DB,
  slug: string,
  excludeOrgId?: string,
): Promise<SlugAvailabilityResult> {
  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number])) {
    return { available: false, takenBy: 'reserved' }
  }

  // Check if slug matches any existing org nanoId (prevents slug-nanoId collision)
  const matchingNanoId = await db.query.organization.findFirst({
    where: eq(organization.nanoId, slug),
    columns: { id: true },
  })

  if (matchingNanoId) {
    return { available: false, takenBy: 'nanoId' }
  }

  const existing = await db.query.organizationSlug.findFirst({
    where: eq(organizationSlug.slug, slug),
    columns: { organizationId: true },
  })

  if (!existing) {
    return { available: true }
  }

  if (excludeOrgId && existing.organizationId === excludeOrgId) {
    return { available: false, takenBy: 'self' }
  }

  return { available: false, takenBy: 'other' }
}
