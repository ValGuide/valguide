import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tour } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type TourBasic = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

export async function getTourById(tourId: string): Promise<TourBasic | null> {
  const [found] = await db
    .select({
      id: tour.id,
      nanoId: tour.nanoId,
      organizationId: tour.organizationId,
      availableLocales: tour.availableLocales,
      archivedAt: tour.archivedAt,
      deletedAt: tour.deletedAt,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
    })
    .from(tour)
    .where(eq(tour.id, tourId))
    .limit(1)

  return found ?? null
}

export async function getTourByNanoId(nanoId: string): Promise<TourBasic | null> {
  const [found] = await db
    .select({
      id: tour.id,
      nanoId: tour.nanoId,
      organizationId: tour.organizationId,
      availableLocales: tour.availableLocales,
      archivedAt: tour.archivedAt,
      deletedAt: tour.deletedAt,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
    })
    .from(tour)
    .where(eq(tour.nanoId, nanoId))
    .limit(1)

  return found ?? null
}
