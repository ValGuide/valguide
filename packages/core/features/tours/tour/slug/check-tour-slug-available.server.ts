import { and, eq } from 'drizzle-orm'
import { RESERVED_SLUGS } from '../../../../utils/slug'
import type { DB } from '../../../db'
import { tour, tourSlug } from '../../schema'

export type TourSlugAvailabilityResult = {
  available: boolean
  takenBy?: 'other' | 'self' | 'reserved' | 'nanoId'
}

export async function checkTourSlugAvailable(
  db: DB,
  slug: string,
  organizationId: string,
  excludeTourId?: string,
): Promise<TourSlugAvailabilityResult> {
  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number])) {
    return { available: false, takenBy: 'reserved' }
  }

  // Check if slug matches any existing tour nanoId (prevents slug-nanoId collision)
  const matchingNanoId = await db.query.tour.findFirst({
    where: eq(tour.nanoId, slug),
    columns: { id: true },
  })

  if (matchingNanoId) {
    return { available: false, takenBy: 'nanoId' }
  }

  const existing = await db.query.tourSlug.findFirst({
    where: and(eq(tourSlug.organizationId, organizationId), eq(tourSlug.slug, slug)),
    columns: { tourId: true },
  })

  if (!existing) {
    return { available: true }
  }

  if (excludeTourId && existing.tourId === excludeTourId) {
    return { available: false, takenBy: 'self' }
  }

  return { available: false, takenBy: 'other' }
}
