import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourAsset } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type TourAssetPublishedItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  publishedAt: Date
}

export type GetTourAssetsPublishedResult = {
  assets: TourAssetPublishedItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getTourAssetsPublished(
  tourNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetTourAssetsPublishedResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  const rows = await db
    .select({
      id: tourAsset.id,
      asset: asset,
      channel: tourAsset.channel,
      locale: tourAsset.locale,
      position: tourAsset.position,
      publishedAt: tourAsset.publishedAt,
    })
    .from(tourAsset)
    .innerJoin(asset, eq(tourAsset.assetId, asset.id))
    .where(eq(tourAsset.tourId, foundTour.id))
    .orderBy(asc(tourAsset.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
