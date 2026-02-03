import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { tour, tourLocaleDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ArchivedTourListItem = {
  nanoId: string
  title: string | null
  locale: string
  availableLocales: string[]
  archivedAt: Date
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function listArchivedTours(
  organizationId: string,
  locale: string = 'en',
): Promise<ArchivedTourListItem[]> {
  const rows = await db
    .select({
      nanoId: tour.nanoId,
      availableLocales: tour.availableLocales,
      archivedAt: tour.archivedAt,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      title: tourLocaleDraft.title,
      locale: tourLocaleDraft.locale,
    })
    .from(tour)
    .leftJoin(tourLocaleDraft, and(eq(tourLocaleDraft.tourId, tour.id), eq(tourLocaleDraft.locale, locale)))
    .where(and(eq(tour.organizationId, organizationId), isNull(tour.deletedAt), isNotNull(tour.archivedAt)))
    .orderBy(desc(tour.archivedAt))

  return rows.map((row) => ({
    nanoId: row.nanoId,
    title: row.title,
    locale: row.locale ?? locale,
    availableLocales: row.availableLocales ?? [],
    archivedAt: row.archivedAt as Date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}
