import { eq } from 'drizzle-orm'
import { RESERVED_SLUGS } from '../../utils/slug'
import type { DB } from '../db'
import { organizationSlug } from './schema'

export type SlugAvailabilityResult = {
  available: boolean
  takenBy?: 'other' | 'self' | 'reserved'
}

export async function checkOrgSlugAvailable(
  db: DB,
  slug: string,
  excludeOrgId?: string,
): Promise<SlugAvailabilityResult> {
  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number])) {
    return { available: false, takenBy: 'reserved' }
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
