import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type TourAssetDraftItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

export type GetTourAssetsDraftResult = {
  assets: TourAssetDraftItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getTourAssetsDraft(
  tourNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetTourAssetsDraftResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const rows = await db
    .select({
      id: tourAssetDraft.id,
      asset: asset,
      channel: tourAssetDraft.channel,
      locale: tourAssetDraft.locale,
      position: tourAssetDraft.position,
      createdAt: tourAssetDraft.createdAt,
    })
    .from(tourAssetDraft)
    .innerJoin(asset, eq(tourAssetDraft.assetId, asset.id))
    .where(eq(tourAssetDraft.tourId, foundTour.id))
    .orderBy(asc(tourAssetDraft.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
