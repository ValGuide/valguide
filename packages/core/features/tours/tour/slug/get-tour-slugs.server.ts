import { desc, eq } from 'drizzle-orm'
import type { DB } from '../../../db'
import { tourSlug } from '../../schema'

export type TourSlugRecord = {
  id: string
  slug: string
  isPrimary: boolean
  createdAt: string
}

export async function getTourSlugs(db: DB, tourId: string): Promise<TourSlugRecord[]> {
  const slugs = await db
    .select({
      id: tourSlug.id,
      slug: tourSlug.slug,
      isPrimary: tourSlug.isPrimary,
      createdAt: tourSlug.createdAt,
    })
    .from(tourSlug)
    .where(eq(tourSlug.tourId, tourId))
    .orderBy(desc(tourSlug.isPrimary), desc(tourSlug.createdAt))

  return slugs.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }))
}
