import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft } from '../schema'

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
  const locale = filters.locale ?? 'en'

  const conditions = [eq(guide.organizationId, organizationId), isNull(guide.deletedAt)]

  if (!filters.includeArchived) {
    conditions.push(isNull(guide.archivedAt))
  }

  const rows = await db
    .select({
      nanoId: guide.nanoId,
      availableLocales: guide.availableLocales,
      archivedAt: guide.archivedAt,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      title: guideLocaleDraft.title,
      locale: guideLocale.locale,
    })
    .from(guide)
    .leftJoin(guideLocale, and(eq(guideLocale.guideId, guide.id), eq(guideLocale.locale, locale)))
    .leftJoin(guideLocaleDraft, eq(guideLocaleDraft.id, guideLocale.draftId))
    .where(and(...conditions))
    .orderBy(desc(guide.updatedAt))

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
