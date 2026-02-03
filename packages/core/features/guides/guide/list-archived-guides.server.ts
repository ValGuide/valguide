import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideLocaleDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ArchivedGuideListItem = {
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

export async function listArchivedGuides(
  organizationId: string,
  locale: string = 'en',
): Promise<ArchivedGuideListItem[]> {
  const rows = await db
    .select({
      nanoId: guide.nanoId,
      availableLocales: guide.availableLocales,
      archivedAt: guide.archivedAt,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      title: guideLocaleDraft.title,
      locale: guideLocaleDraft.locale,
    })
    .from(guide)
    .leftJoin(guideLocaleDraft, and(eq(guideLocaleDraft.guideId, guide.id), eq(guideLocaleDraft.locale, locale)))
    .where(and(eq(guide.organizationId, organizationId), isNull(guide.deletedAt), isNotNull(guide.archivedAt)))
    .orderBy(desc(guide.archivedAt))

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
