import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { type AssetType, asset, guideAsset, stopAsset } from './schema'

export type GetAssetsFilters = {
  type?: AssetType
  locale?: string
  organizationId?: string
  uploadedBy?: string
}

export async function getAssets(filters?: GetAssetsFilters) {
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

  const query = db.select().from(asset)

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(desc(asset.createdAt))
  }

  return await query.orderBy(desc(asset.createdAt))
}

export async function getAssetById(assetId: string) {
  return await db.query.asset.findFirst({
    where: eq(asset.id, assetId),
  })
}

export async function getAssetByNanoId(nanoId: string) {
  return await db.query.asset.findFirst({
    where: eq(asset.nanoId, nanoId),
  })
}

export async function getAssetsByIds(assetIds: string[]) {
  if (assetIds.length === 0) return []

  return await db.select().from(asset).where(inArray(asset.id, assetIds))
}

export async function getGuideAssets(guideId: string, locale?: string) {
  const conditions = [eq(guideAsset.guideId, guideId)]

  if (locale) {
    conditions.push(eq(guideAsset.locale, locale))
  }

  const results = await db
    .select()
    .from(guideAsset)
    .where(and(...conditions))
    .leftJoin(asset, eq(guideAsset.assetId, asset.id))
    .orderBy(guideAsset.order)

  return results.map((r: (typeof results)[0]) => ({
    ...r.guide_asset,
    asset: r.asset,
  }))
}

export async function getStopAssets(stopId: string, locale?: string) {
  const conditions = [eq(stopAsset.stopId, stopId)]

  if (locale) {
    conditions.push(eq(stopAsset.locale, locale))
  }

  const results = await db
    .select()
    .from(stopAsset)
    .where(and(...conditions))
    .leftJoin(asset, eq(stopAsset.assetId, asset.id))
    .orderBy(stopAsset.order)

  return results.map((r: (typeof results)[0]) => ({
    ...r.stop_asset,
    asset: r.asset,
  }))
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

export async function detachAssetFromGuide(guideAssetId: string) {
  await db.delete(guideAsset).where(eq(guideAsset.id, guideAssetId))
}

export async function detachAssetFromStop(stopAssetId: string) {
  await db.delete(stopAsset).where(eq(stopAsset.id, stopAssetId))
}
