import { db } from '@valguide/core/features/db'
import { asc, eq } from 'drizzle-orm'
import { type Asset, guideAsset, guideAssetVersion, stopAsset, stopAssetVersion } from './schema'

export type AssetVersionItem = {
  id: string
  assetId: string
  order: number
  role: string
  locale: string | null
  asset: Asset
}

// ============================================================================
// Guide Asset Version Queries
// ============================================================================

/**
 * Get guide assets for a specific version (draft or published).
 * If version is 'draft' and no draft exists, falls back to published.
 */
export async function getGuideAssetsByVersion(
  guideId: string,
  version: 'draft' | 'published',
): Promise<AssetVersionItem[]> {
  const guideAssetRecord = await db.query.guideAsset.findFirst({
    where: eq(guideAsset.guideId, guideId),
  })

  if (!guideAssetRecord) return []

  // For draft, use draftVersionId, fall back to currentVersionId
  // For published, only use currentVersionId
  const versionId =
    version === 'draft'
      ? (guideAssetRecord.draftVersionId ?? guideAssetRecord.currentVersionId)
      : guideAssetRecord.currentVersionId

  if (!versionId) return []

  const items = await db.query.guideAssetVersion.findMany({
    where: eq(guideAssetVersion.versionId, versionId),
    with: { asset: true },
    orderBy: [asc(guideAssetVersion.order)],
  })

  return items.map((item) => ({
    id: item.id,
    assetId: item.assetId,
    order: item.order,
    role: item.role,
    locale: item.locale,
    asset: item.asset,
  }))
}

/**
 * Check if guide has asset changes (draft differs from published).
 */
export async function hasGuideAssetChanges(guideId: string): Promise<boolean> {
  const guideAssetRecord = await db.query.guideAsset.findFirst({
    where: eq(guideAsset.guideId, guideId),
  })

  // Has draft that's different from published
  return !!guideAssetRecord?.draftVersionId
}

/**
 * Get guide asset version info (for status display).
 */
export async function getGuideAssetVersionInfo(guideId: string): Promise<{
  currentVersionId: string | null
  draftVersionId: string | null
  hasDraft: boolean
  hasPublished: boolean
}> {
  const guideAssetRecord = await db.query.guideAsset.findFirst({
    where: eq(guideAsset.guideId, guideId),
  })

  return {
    currentVersionId: guideAssetRecord?.currentVersionId ?? null,
    draftVersionId: guideAssetRecord?.draftVersionId ?? null,
    hasDraft: !!guideAssetRecord?.draftVersionId,
    hasPublished: !!guideAssetRecord?.currentVersionId,
  }
}

// ============================================================================
// Stop Asset Version Queries
// ============================================================================

/**
 * Get stop assets for a specific version (draft or published).
 * If version is 'draft' and no draft exists, falls back to published.
 */
export async function getStopAssetsByVersion(
  stopId: string,
  version: 'draft' | 'published',
): Promise<AssetVersionItem[]> {
  const stopAssetRecord = await db.query.stopAsset.findFirst({
    where: eq(stopAsset.stopId, stopId),
  })

  if (!stopAssetRecord) return []

  const versionId =
    version === 'draft'
      ? (stopAssetRecord.draftVersionId ?? stopAssetRecord.currentVersionId)
      : stopAssetRecord.currentVersionId

  if (!versionId) return []

  const items = await db.query.stopAssetVersion.findMany({
    where: eq(stopAssetVersion.versionId, versionId),
    with: { asset: true },
    orderBy: [asc(stopAssetVersion.order)],
  })

  return items.map((item) => ({
    id: item.id,
    assetId: item.assetId,
    order: item.order,
    role: item.role,
    locale: item.locale,
    asset: item.asset,
  }))
}

/**
 * Check if stop has asset changes (draft differs from published).
 */
export async function hasStopAssetChanges(stopId: string): Promise<boolean> {
  const stopAssetRecord = await db.query.stopAsset.findFirst({
    where: eq(stopAsset.stopId, stopId),
  })

  return !!stopAssetRecord?.draftVersionId
}

/**
 * Get stop asset version info (for status display).
 */
export async function getStopAssetVersionInfo(stopId: string): Promise<{
  currentVersionId: string | null
  draftVersionId: string | null
  hasDraft: boolean
  hasPublished: boolean
}> {
  const stopAssetRecord = await db.query.stopAsset.findFirst({
    where: eq(stopAsset.stopId, stopId),
  })

  return {
    currentVersionId: stopAssetRecord?.currentVersionId ?? null,
    draftVersionId: stopAssetRecord?.draftVersionId ?? null,
    hasDraft: !!stopAssetRecord?.draftVersionId,
    hasPublished: !!stopAssetRecord?.currentVersionId,
  }
}
