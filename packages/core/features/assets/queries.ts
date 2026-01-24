import { db } from '@valguide/core/features/db'
import { and, countDistinct, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { type AssetType, asset, guideAsset, guideAssetVersion, stopAsset, stopAssetVersion } from './schema'

export type GetAssetsFilters = {
  type?: AssetType
  locale?: string
  organizationId?: string
  uploadedBy?: string
}

export type AssetWithUsage = typeof asset.$inferSelect & {
  guideCount: number
  stopCount: number
}

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const conditions = []

  if (filters?.type) {
    conditions.push(eq(asset.type, filters.type))
  }
  if (filters?.locale) {
    conditions.push(eq(asset.locale, filters.locale))
  }
  if (filters?.organizationId) {
    conditions.push(eq(asset.organizationId, filters.organizationId))
  }
  if (filters?.uploadedBy) {
    conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
  }

  const guideCountSq = db
    .select({ count: countDistinct(guideAsset.guideId) })
    .from(guideAssetVersion)
    .innerJoin(guideAsset, eq(guideAssetVersion.guideAssetId, guideAsset.id))
    .where(eq(guideAssetVersion.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAssetVersion)
    .innerJoin(stopAsset, eq(stopAssetVersion.stopAssetId, stopAsset.id))
    .where(eq(stopAssetVersion.assetId, asset.id))

  const query = db
    .select({
      ...getTableColumns(asset),
      guideCount: sql<number>`COALESCE(${guideCountSq}, 0)`.as('guide_count'),
      stopCount: sql<number>`COALESCE(${stopCountSq}, 0)`.as('stop_count'),
    })
    .from(asset)
    .orderBy(desc(asset.createdAt))

  if (conditions.length > 0) {
    return query.where(and(...conditions))
  }

  return query
}
