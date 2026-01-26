import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft, guideSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type LocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  revision: number
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

export type GuideDetail = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: LocaleDraftInfo[]
  settings: {
    themeId: string | null
    settingsJson: string | null
  } | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideDetail(nanoId: string): Promise<GuideDetail | null> {
  const [foundGuide] = await db
    .select()
    .from(guide)
    .where(and(eq(guide.nanoId, nanoId), isNull(guide.deletedAt)))
    .limit(1)

  if (!foundGuide) return null

  const localeRows = await db
    .select({
      locale: guideLocale.locale,
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
      revision: guideLocaleDraft.revision,
      publishedVersionId: guideLocale.publishedVersionId,
      lastPublishedDraftRevision: guideLocale.lastPublishedDraftRevision,
    })
    .from(guideLocale)
    .innerJoin(guideLocaleDraft, eq(guideLocaleDraft.guideLocaleId, guideLocale.id))
    .where(eq(guideLocale.guideId, foundGuide.id))

  const locales: LocaleDraftInfo[] = localeRows.map((row) => ({
    locale: row.locale,
    title: row.title,
    description: row.description,
    revision: row.revision,
    hasUnpublishedChanges: row.publishedVersionId === null || row.revision !== row.lastPublishedDraftRevision,
    publishedVersionId: row.publishedVersionId,
  }))

  const [settings] = await db
    .select({
      themeId: guideSettingsDraft.themeId,
      settingsJson: guideSettingsDraft.settingsJson,
    })
    .from(guideSettingsDraft)
    .where(eq(guideSettingsDraft.guideId, foundGuide.id))
    .limit(1)

  return {
    id: foundGuide.id,
    nanoId: foundGuide.nanoId,
    organizationId: foundGuide.organizationId,
    availableLocales: foundGuide.availableLocales ?? [],
    archivedAt: foundGuide.archivedAt,
    createdAt: foundGuide.createdAt,
    updatedAt: foundGuide.updatedAt,
    locales,
    settings: settings ?? null,
  }
}
