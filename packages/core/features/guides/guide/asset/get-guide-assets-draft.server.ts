import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideAssetDraftItem = {
  id: string
  asset: Asset
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

  const rows = await db
    .select({
      id: guideAssetDraft.id,
      asset: asset,
      channel: guideAssetDraft.channel,
      locale: guideAssetDraft.locale,
      position: guideAssetDraft.position,
      createdAt: guideAssetDraft.createdAt,
    })
    .from(guideAssetDraft)
    .innerJoin(asset, eq(guideAssetDraft.assetId, asset.id))
    .where(eq(guideAssetDraft.guideId, foundGuide.id))
    .orderBy(asc(guideAssetDraft.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
