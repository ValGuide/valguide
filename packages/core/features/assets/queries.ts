import { and, count, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../db'
import { type AssetType, asset, guideAsset, stopAsset } from './schema'

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

  const guideCountSq = db.select({ count: count() }).from(guideAsset).where(eq(guideAsset.assetId, asset.id))

  const stopCountSq = db.select({ count: count() }).from(stopAsset).where(eq(stopAsset.assetId, asset.id))

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

export async function attachAssetToGuide({
  guideId,
  assetId,
  role,
  locale,
  order = 0,
}: {
  guideId: string
  assetId: string
  role: string
  locale?: string
  order?: number
}) {
  const [result] = await db
    .insert(guideAsset)
    .values({
      guideId,
      assetId,
      role,
      locale: locale || null,
      order,
    })
    .returning()

  return result
}

export async function attachAssetToStop({
  stopId,
  assetId,
  role,
  locale,
  order = 0,
}: {
  stopId: string
  assetId: string
  role: string
  locale?: string
  order?: number
}) {
  const [result] = await db
    .insert(stopAsset)
    .values({
      stopId,
      assetId,
      role,
      locale: locale || null,
      order,
    })
    .returning()

  return result
}
