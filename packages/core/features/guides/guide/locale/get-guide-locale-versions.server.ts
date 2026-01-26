import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleVersion } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideLocaleVersionInfo = {
  id: string
  version: number
  title: string | null
  description: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
  isCurrent: boolean
}

export type GetGuideVersionsResult = {
  locale: string
  currentVersionId: string | null
  versions: GuideLocaleVersionInfo[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideVersions(guideNanoId: string, locale: string): Promise<GetGuideVersionsResult | null> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) return null

  const [localeRow] = await db
    .select({
      id: guideLocale.id,
      locale: guideLocale.locale,
      publishedVersionId: guideLocale.publishedVersionId,
    })
    .from(guideLocale)
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .limit(1)

  if (!localeRow) return null

  const versions = await db
    .select({
      id: guideLocaleVersion.id,
      version: guideLocaleVersion.version,
      title: guideLocaleVersion.title,
      description: guideLocaleVersion.description,
      createdAt: guideLocaleVersion.createdAt,
      createdBy: guideLocaleVersion.createdBy,
      publishedAt: guideLocaleVersion.publishedAt,
    })
    .from(guideLocaleVersion)
    .where(eq(guideLocaleVersion.guideLocaleId, localeRow.id))
    .orderBy(desc(guideLocaleVersion.version))

  return {
    locale: localeRow.locale,
    currentVersionId: localeRow.publishedVersionId,
    versions: versions.map((v) => ({
      ...v,
      isCurrent: v.id === localeRow.publishedVersionId,
    })),
  }
}
