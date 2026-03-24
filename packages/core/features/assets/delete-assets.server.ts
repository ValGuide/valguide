import { inArray } from 'drizzle-orm'
import { db } from '../db'
import { deleteObject } from '../storage/upload.server'
import { type AssetDeletionEligibility, getAssetDeletionEligibility } from './asset-deletion-eligibility.server'
import { asset } from './schema'

export type DeleteAssetsResult = {
  deletedAssetIds: string[]
  blockedAssets: AssetDeletionEligibility[]
  missingAssetIds: string[]
}

export async function deleteAssets(assetIds: string[], organizationId: string): Promise<DeleteAssetsResult> {
  const preview = await getAssetDeletionEligibility(assetIds, organizationId)
  const previewById = new Map(preview.map((item) => [item.assetId, item]))
  const missingAssetIds = assetIds.filter((assetId) => !previewById.has(assetId))
  const deletableAssets = preview.filter((item) => item.deletable)
  const blockedAssets = preview.filter((item) => !item.deletable)

  if (deletableAssets.length === 0) {
    return {
      deletedAssetIds: [],
      blockedAssets,
      missingAssetIds,
    }
  }

  const deletableAssetIds = deletableAssets.map((item) => item.assetId)
  const storageObjects = await db
    .select({
      id: asset.id,
      storagePath: asset.storagePath,
    })
    .from(asset)
    .where(inArray(asset.id, deletableAssetIds))

  for (const object of storageObjects) {
    await deleteObject(object.storagePath)
  }

  await db.delete(asset).where(inArray(asset.id, deletableAssetIds))

  return {
    deletedAssetIds: storageObjects.map((item) => item.id),
    blockedAssets,
    missingAssetIds,
  }
}
