import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { db } from '../../db'
import { stop, stopLocaleDraft } from '../schema'
import { LOCALE_PRIORITY } from '../utils'

// =============================================================================
// TYPES
// =============================================================================

export type StopListItem = {
  nanoId: string
  title: string | null
  locale: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ListStopsFilters = {
  includeArchived?: boolean
  locale?: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function listStops(organizationId: string, filters: ListStopsFilters = {}): Promise<StopListItem[]> {
  const preferredLocale = filters.locale ?? 'en'

  const conditions = [eq(stop.organizationId, organizationId), isNull(stop.deletedAt)]

  if (!filters.includeArchived) {
    conditions.push(isNull(stop.archivedAt))
  }

  const titleSubquery = db
    .select({
      title: stopLocaleDraft.title,
      locale: stopLocaleDraft.locale,
    })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, stop.id), isNotNull(stopLocaleDraft.title)))
    .orderBy(
      sql`CASE ${stopLocaleDraft.locale}
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
      nanoId: stop.nanoId,
      availableLocales: stop.availableLocales,
      archivedAt: stop.archivedAt,
      createdAt: stop.createdAt,
      updatedAt: stop.updatedAt,
      title: titleSubquery.title,
      locale: titleSubquery.locale,
    })
    .from(stop)
    .leftJoinLateral(titleSubquery, sql`true`)
    .where(and(...conditions))
    .orderBy(desc(stop.updatedAt))

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
