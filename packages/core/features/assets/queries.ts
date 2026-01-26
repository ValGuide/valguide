import { db } from '@valguide/core/features/db'
import { and, countDistinct, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { guideAsset, guideAssetDraft, stopAsset, stopAssetDraft } from '../guides/schema'
import { type AssetType, asset } from './schema'

export type GetAssetsFilters = {
  type?: AssetType
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
  if (filters?.organizationId) {
    conditions.push(eq(asset.organizationId, filters.organizationId))
  }
  if (filters?.uploadedBy) {
    conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
  }

  // Count distinct guides using this asset (from live assignments)
  const guideCountSq = db
    .select({ count: countDistinct(guideAsset.guideId) })
    .from(guideAsset)
    .where(eq(guideAsset.assetId, asset.id))

  // Count distinct stops using this asset (from live assignments)
  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

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

export async function getAssetByNanoId(nanoId: string) {
  return db.query.asset.findFirst({
    where: eq(asset.nanoId, nanoId),
  })
}

export async function getAssetById(id: string) {
  return db.query.asset.findFirst({
    where: eq(asset.id, id),
  })
}

/**
 * Get all draft asset assignments for a guide
 */
export async function getGuideAssetsDraft(guideId: string, channel?: string, locale?: string | null) {
  const conditions = [eq(guideAssetDraft.guideId, guideId)]

  if (channel) {
    conditions.push(eq(guideAssetDraft.channel, channel))
  }
  if (locale !== undefined) {
    conditions.push(locale === null ? sql`${guideAssetDraft.locale} IS NULL` : eq(guideAssetDraft.locale, locale))
  }

  return db
    .select()
    .from(guideAssetDraft)
    .innerJoin(asset, eq(guideAssetDraft.assetId, asset.id))
    .where(and(...conditions))
    .orderBy(guideAssetDraft.position)
}

/**
 * Get all live asset assignments for a guide
 */
export async function getGuideAssetsLive(guideId: string, channel?: string, locale?: string | null) {
  const conditions = [eq(guideAsset.guideId, guideId)]

  if (channel) {
    conditions.push(eq(guideAsset.channel, channel))
  }
  if (locale !== undefined) {
    conditions.push(locale === null ? sql`${guideAsset.locale} IS NULL` : eq(guideAsset.locale, locale))
  }

  return db
    .select()
    .from(guideAsset)
    .innerJoin(asset, eq(guideAsset.assetId, asset.id))
    .where(and(...conditions))
    .orderBy(guideAsset.position)
}

/**
 * Get all draft asset assignments for a stop
 */
export async function getStopAssetsDraft(stopId: string, channel?: string, locale?: string | null) {
  const conditions = [eq(stopAssetDraft.stopId, stopId)]

  if (channel) {
    conditions.push(eq(stopAssetDraft.channel, channel))
  }
  if (locale !== undefined) {
    conditions.push(locale === null ? sql`${stopAssetDraft.locale} IS NULL` : eq(stopAssetDraft.locale, locale))
  }

  return db
    .select()
    .from(stopAssetDraft)
    .innerJoin(asset, eq(stopAssetDraft.assetId, asset.id))
    .where(and(...conditions))
    .orderBy(stopAssetDraft.position)
}

/**
 * Get all live asset assignments for a stop
 */
export async function getStopAssetsLive(stopId: string, channel?: string, locale?: string | null) {
  const conditions = [eq(stopAsset.stopId, stopId)]

  if (channel) {
    conditions.push(eq(stopAsset.channel, channel))
  }
  if (locale !== undefined) {
    conditions.push(locale === null ? sql`${stopAsset.locale} IS NULL` : eq(stopAsset.locale, locale))
  }

  return db
    .select()
    .from(stopAsset)
    .innerJoin(asset, eq(stopAsset.assetId, asset.id))
    .where(and(...conditions))
    .orderBy(stopAsset.position)
}
