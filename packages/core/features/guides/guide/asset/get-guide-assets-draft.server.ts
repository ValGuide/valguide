import { asc, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideAssetDraftItem = {
  id: string
  assetId: string
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

export type GetGuideAssetsDraftResult = {
  assets: GuideAssetDraftItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideAssetsDraft(
  guideNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetGuideAssetsDraftResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const query = db
    .select({
      id: guideAssetDraft.id,
      assetId: guideAssetDraft.assetId,
      channel: guideAssetDraft.channel,
      locale: guideAssetDraft.locale,
      position: guideAssetDraft.position,
      createdAt: guideAssetDraft.createdAt,
    })
    .from(guideAssetDraft)
    .where(eq(guideAssetDraft.guideId, foundGuide.id))
    .orderBy(asc(guideAssetDraft.position))
    .$dynamic()

  const assets = await query

  // Filter by channel and locale if provided
  const filtered = assets.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
