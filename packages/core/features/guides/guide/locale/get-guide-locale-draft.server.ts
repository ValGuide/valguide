import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  revision: number
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideLocaleDraft(guideNanoId: string, locale: string): Promise<GuideLocaleDraftResult | null> {
  const [foundGuide] = await db
    .select({ id: guide.id, availableLocales: guide.availableLocales })
    .from(guide)
    .where(eq(guide.nanoId, guideNanoId))
    .limit(1)

  if (!foundGuide) return null

  // Check if locale is in availableLocales
  if (!foundGuide.availableLocales.includes(locale)) return null

  // Try to get locale with its draft
  const [row] = await db
    .select({
      localeId: guideLocale.id,
      locale: guideLocale.locale,
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
      revision: guideLocaleDraft.revision,
      publishedVersionId: guideLocale.publishedVersionId,
      lastPublishedDraftRevision: guideLocale.lastPublishedDraftRevision,
    })
    .from(guideLocale)
    .leftJoin(guideLocaleDraft, eq(guideLocaleDraft.guideLocaleId, guideLocale.id))
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .limit(1)

  // Auto-create missing locale + draft
  if (!row) {
    const [newLocale] = await db
      .insert(guideLocale)
      .values({ guideId: foundGuide.id, locale })
      .returning({ id: guideLocale.id })
    await db.insert(guideLocaleDraft).values({ guideLocaleId: newLocale.id })
  } else if (row.revision === null) {
    // Auto-create missing draft if locale exists but draft was deleted
    await db.insert(guideLocaleDraft).values({ guideLocaleId: row.localeId })
  }

  const title = row?.title ?? null
  const description = row?.description ?? null
  const revision = row?.revision ?? 0
  const publishedVersionId = row?.publishedVersionId ?? null
  const lastPublishedDraftRevision = row?.lastPublishedDraftRevision ?? null

  return {
    locale,
    title,
    description,
    revision,
    hasUnpublishedChanges: publishedVersionId === null || revision !== lastPublishedDraftRevision,
    publishedVersionId,
  }
}
