import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleDraft } from '../schema'

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
  const locale = filters.locale ?? 'en'

  const conditions = [eq(stop.organizationId, organizationId), isNull(stop.deletedAt)]

  if (!filters.includeArchived) {
    conditions.push(isNull(stop.archivedAt))
  }

  const rows = await db
    .select({
      nanoId: stop.nanoId,
      availableLocales: stop.availableLocales,
      archivedAt: stop.archivedAt,
      createdAt: stop.createdAt,
      updatedAt: stop.updatedAt,
      title: stopLocaleDraft.title,
      locale: stopLocale.locale,
    })
    .from(stop)
    .leftJoin(stopLocale, and(eq(stopLocale.stopId, stop.id), eq(stopLocale.locale, locale)))
    .leftJoin(stopLocaleDraft, eq(stopLocaleDraft.id, stopLocale.draftId))
    .where(and(...conditions))
    .orderBy(desc(stop.updatedAt))

  return rows.map((row) => ({
    nanoId: row.nanoId,
    title: row.title,
    locale: row.locale ?? locale,
    availableLocales: row.availableLocales ?? [],
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}
