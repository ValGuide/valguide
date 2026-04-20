import { eq } from 'drizzle-orm'
import { deleteObject } from '../../platform/storage/object-storage.server'
import { NotFoundError } from '../auth/authorization'
import { db } from '../db'
import { getAssetDeletionEligibility } from './asset-deletion-eligibility.server'
import { ASSET_IN_USE_ERROR_CODE } from './delete-asset-errors'
import { asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteAssetResult = {
  success: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteAsset(assetId: string): Promise<DeleteAssetResult> {
  const [eligibility] = await getAssetDeletionEligibility([assetId])

  if (eligibility && !eligibility.deletable) {
    throw new Error(ASSET_IN_USE_ERROR_CODE)
  }

  const assetData = await db.query.asset.findFirst({ where: eq(asset.id, assetId) })

  if (!assetData) {
    throw new NotFoundError('Asset')
  }

  await deleteObject(assetData.storagePath)

  await db.delete(asset).where(eq(asset.id, assetId))

  return { success: true }
}
