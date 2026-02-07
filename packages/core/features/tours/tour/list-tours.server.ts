import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { asset } from '../../assets/schema'
import { db } from '../../db'
import { tour, tourAssetDraft, tourLocaleDraft } from '../schema'
import { LOCALE_PRIORITY } from '../utils'

// =============================================================================
// TYPES
// =============================================================================

export type TourCoverImage = {
  storagePath: string
  publicUrl: string | null
}

export type TourListItem = {
  nanoId: string
  title: string | null
  locale: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  coverImage: TourCoverImage | null
}

export type ListToursFilters = {
  includeArchived?: boolean
  locale?: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function listTours(organizationId: string, filters: ListToursFilters = {}): Promise<TourListItem[]> {
  const preferredLocale = filters.locale ?? 'en'

  const conditions = [eq(tour.organizationId, organizationId), isNull(tour.deletedAt)]

  if (!filters.includeArchived) {
    conditions.push(isNull(tour.archivedAt))
  }

  const titleSubquery = db
    .select({
      title: tourLocaleDraft.title,
      locale: tourLocaleDraft.locale,
    })
    .from(tourLocaleDraft)
    .where(and(eq(tourLocaleDraft.tourId, tour.id), isNotNull(tourLocaleDraft.title)))
    .orderBy(
      sql`CASE ${tourLocaleDraft.locale}
        WHEN ${preferredLocale} THEN 0
        WHEN ${LOCALE_PRIORITY[0]} THEN 1
        WHEN ${LOCALE_PRIORITY[1]} THEN 2
        WHEN ${LOCALE_PRIORITY[2]} THEN 3
        ELSE 4
      END`,
    )
    .limit(1)
    .as('best_title')

  const rows = await db
    .select({
      nanoId: tour.nanoId,
      availableLocales: tour.availableLocales,
      archivedAt: tour.archivedAt,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      title: titleSubquery.title,
      locale: titleSubquery.locale,
    })
    .from(tour)
    .leftJoinLateral(titleSubquery, sql`true`)
    .where(and(...conditions))
    .orderBy(desc(tour.updatedAt))

  return rows.map((row) => ({
    nanoId: row.nanoId,
    title: row.title,
    locale: row.locale ?? preferredLocale,
    availableLocales: row.availableLocales ?? [],
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}
