import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft } from '../schema'
import { LOCALE_PRIORITY } from '../utils'

// =============================================================================
// TYPES
// =============================================================================

export type GuideListItem = {
  nanoId: string
  title: string | null
  locale: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ListGuidesFilters = {
  includeArchived?: boolean
  locale?: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function listGuides(organizationId: string, filters: ListGuidesFilters = {}): Promise<GuideListItem[]> {
  const preferredLocale = filters.locale ?? 'en'

  const conditions = [eq(guide.organizationId, organizationId), isNull(guide.deletedAt)]

  if (!filters.includeArchived) {
    conditions.push(isNull(guide.archivedAt))
  }

  const titleSubquery = db
    .select({
      title: guideLocaleDraft.title,
      locale: guideLocale.locale,
    })
    .from(guideLocale)
    .innerJoin(guideLocaleDraft, eq(guideLocaleDraft.guideLocaleId, guideLocale.id))
    .where(and(eq(guideLocale.guideId, guide.id), isNotNull(guideLocaleDraft.title)))
    .orderBy(
      sql`CASE ${guideLocale.locale}
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
      nanoId: guide.nanoId,
      availableLocales: guide.availableLocales,
      archivedAt: guide.archivedAt,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      title: titleSubquery.title,
      locale: titleSubquery.locale,
    })
    .from(guide)
    .leftJoinLateral(titleSubquery, sql`true`)
    .where(and(...conditions))
    .orderBy(desc(guide.updatedAt))

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
