import { asc, eq } from 'drizzle-orm'
import type { Asset } from '../../../assets/schema'
import { asset } from '../../../assets/schema'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopAssetDraftItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

export type GetStopAssetsDraftResult = {
  assets: StopAssetDraftItem[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopAssetsDraft(
  stopNanoId: string,
  channel?: string,
  locale?: string | null,
): Promise<GetStopAssetsDraftResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const rows = await db
    .select({
      id: stopAssetDraft.id,
      asset: asset,
      channel: stopAssetDraft.channel,
      locale: stopAssetDraft.locale,
      position: stopAssetDraft.position,
      createdAt: stopAssetDraft.createdAt,
    })
    .from(stopAssetDraft)
    .innerJoin(asset, eq(stopAssetDraft.assetId, asset.id))
    .where(eq(stopAssetDraft.stopId, foundStop.id))
    .orderBy(asc(stopAssetDraft.position))

  // Filter by channel and locale if provided
  const filtered = rows.filter((a) => {
    if (channel && a.channel !== channel) return false
    if (locale !== undefined && a.locale !== locale) return false
    return true
  })

  return { assets: filtered }
}
