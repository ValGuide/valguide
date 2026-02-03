import { and, countDistinct, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../db'
import { tourAsset, stopAsset } from '../tours/schema'
import { type AssetType, asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetAssetsFilters = {
  type?: AssetType
  organizationId?: string
  uploadedBy?: string
}

export type AssetWithUsage = typeof asset.$inferSelect & {
  tourCount: number
  stopCount: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const conditions = []

  if (filters?.type) {
    conditions.push(eq(asset.type, filters.type))
  }
  if (filters?.organizationId) {
    conditions.push(eq(asset.organizationId, filters.organizationId))
  }
  if (filters?.uploadedBy) {
    conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
  }

  const tourCountSq = db
    .select({ count: countDistinct(tourAsset.tourId) })
    .from(tourAsset)
    .where(eq(tourAsset.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

  const query = db
    .select({
      ...getTableColumns(asset),
      tourCount: sql<number>`COALESCE(${tourCountSq}, 0)`.as('tour_count'),
      stopCount: sql<number>`COALESCE(${stopCountSq}, 0)`.as('stop_count'),
    })
    .from(asset)
    .orderBy(desc(asset.createdAt))

  if (conditions.length > 0) {
    return query.where(and(...conditions))
  }

  return query
}
