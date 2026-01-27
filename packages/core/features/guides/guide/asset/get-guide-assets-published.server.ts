import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAsset } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideAssetPublishedItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  publishedAt: Date
}

export type GetGuideAssetsPublishedResult = {
  assets: GuideAssetPublishedItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideAssetsPublished(
  guideNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetGuideAssetsPublishedResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const rows = await db
    .select({
      id: guideAsset.id,
      asset: asset,
      channel: guideAsset.channel,
      locale: guideAsset.locale,
      position: guideAsset.position,
      publishedAt: guideAsset.publishedAt,
    })
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(eq(guideAsset.guideId, foundGuide.id))
    .orderBy(asc(guideAsset.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
