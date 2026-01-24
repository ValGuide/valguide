import { db } from '@valguide/core/features/db'
import { asc, eq } from 'drizzle-orm'
import { guide, stop } from '../guides/schema'
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
 * Get guide assets for a specific version (draft or published)
 * If version is 'draft' and no draft exists, falls back to published
 */
export async function getGuideAssetsByVersion(
  guideId: string,
  version: 'draft' | 'published',
): Promise<AssetVersionItem[]> {
  const guideData = await db.query.guide.findFirst({
    where: eq(guide.id, guideId),
    columns: { currentAssetVersionId: true, draftAssetVersionId: true },
  })

  if (!guideData) return []

  // For draft, use draftAssetVersionId, fall back to currentAssetVersionId
  // For published, only use currentAssetVersionId
  const versionId =
    version === 'draft'
      ? (guideData.draftAssetVersionId ?? guideData.currentAssetVersionId)
      : guideData.currentAssetVersionId

  if (!versionId) return []

  const items = await db.query.guideAssetVersion.findMany({
    where: eq(guideAssetVersion.guideAssetId, versionId),
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
 * Check if guide has asset changes (draft differs from published)
 */
export async function hasGuideAssetChanges(guideId: string): Promise<boolean> {
  const guideData = await db.query.guide.findFirst({
    where: eq(guide.id, guideId),
    columns: { currentAssetVersionId: true, draftAssetVersionId: true },
  })

  // Has draft that's different from published
  return !!guideData?.draftAssetVersionId
}

/**
 * Get guide asset version info (for status display)
 */
export async function getGuideAssetVersionInfo(guideId: string): Promise<{
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
  hasDraft: boolean
  hasPublished: boolean
}> {
  const guideData = await db.query.guide.findFirst({
    where: eq(guide.id, guideId),
    columns: { currentAssetVersionId: true, draftAssetVersionId: true },
  })

  return {
    currentAssetVersionId: guideData?.currentAssetVersionId ?? null,
    draftAssetVersionId: guideData?.draftAssetVersionId ?? null,
    hasDraft: !!guideData?.draftAssetVersionId,
    hasPublished: !!guideData?.currentAssetVersionId,
  }
}

/**
 * Get guide asset version with full details
 */
export async function getGuideAssetVersion(versionId: string) {
  return db.query.guideAsset.findFirst({
    where: eq(guideAsset.id, versionId),
    with: {
      versions: {
        with: { asset: true },
        orderBy: [asc(guideAssetVersion.order)],
      },
    },
  })
}

// ============================================================================
// Stop Asset Version Queries
// ============================================================================

/**
 * Get stop assets for a specific version (draft or published)
 * If version is 'draft' and no draft exists, falls back to published
 */
export async function getStopAssetsByVersion(
  stopId: string,
  version: 'draft' | 'published',
): Promise<AssetVersionItem[]> {
  const stopData = await db.query.stop.findFirst({
    where: eq(stop.id, stopId),
    columns: { currentAssetVersionId: true, draftAssetVersionId: true },
  })

  if (!stopData) return []

  const versionId =
    version === 'draft'
      ? (stopData.draftAssetVersionId ?? stopData.currentAssetVersionId)
      : stopData.currentAssetVersionId

  if (!versionId) return []

  const items = await db.query.stopAssetVersion.findMany({
    where: eq(stopAssetVersion.stopAssetId, versionId),
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
 * Check if stop has asset changes (draft differs from published)
 */
export async function hasStopAssetChanges(stopId: string): Promise<boolean> {
  const stopData = await db.query.stop.findFirst({
    where: eq(stop.id, stopId),
    columns: { draftAssetVersionId: true },
  })

  return !!stopData?.draftAssetVersionId
}

/**
 * Get stop asset version info (for status display)
 */
export async function getStopAssetVersionInfo(stopId: string): Promise<{
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
  hasDraft: boolean
  hasPublished: boolean
}> {
  const stopData = await db.query.stop.findFirst({
    where: eq(stop.id, stopId),
    columns: { currentAssetVersionId: true, draftAssetVersionId: true },
  })

  return {
    currentAssetVersionId: stopData?.currentAssetVersionId ?? null,
    draftAssetVersionId: stopData?.draftAssetVersionId ?? null,
    hasDraft: !!stopData?.draftAssetVersionId,
    hasPublished: !!stopData?.currentAssetVersionId,
  }
}

/**
 * Get stop asset version with full details
 */
export async function getStopAssetVersion(versionId: string) {
  return db.query.stopAsset.findFirst({
    where: eq(stopAsset.id, versionId),
    with: {
      versions: {
        with: { asset: true },
        orderBy: [asc(stopAssetVersion.order)],
      },
    },
  })
}
