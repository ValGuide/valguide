import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAsset } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopAssetPublishedItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  publishedAt: Date
}

export type GetStopAssetsPublishedResult = {
  assets: StopAssetPublishedItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopAssetsPublished(
  stopNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetStopAssetsPublishedResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const rows = await db
    .select({
      id: stopAsset.id,
      asset: asset,
      channel: stopAsset.channel,
      locale: stopAsset.locale,
      position: stopAsset.position,
      publishedAt: stopAsset.publishedAt,
    })
    .from(stopAsset)
    .innerJoin(asset, eq(stopAsset.assetId, asset.id))
    .where(eq(stopAsset.stopId, foundStop.id))
    .orderBy(asc(stopAsset.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
