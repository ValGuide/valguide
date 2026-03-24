import { type AssetDeletionEligibility, getAssetDeletionEligibility } from './asset-deletion-eligibility.server'

export type BulkAssetDeletionPreview = {
  assets: AssetDeletionEligibility[]
  missingAssetIds: string[]
}

export async function getBulkAssetDeletionPreview(
  assetIds: string[],
  organizationId: string,
): Promise<BulkAssetDeletionPreview> {
  const assets = await getAssetDeletionEligibility(assetIds, organizationId)
  const foundAssetIds = new Set(assets.map((item) => item.assetId))

  return {
    assets,
    missingAssetIds: assetIds.filter((assetId) => !foundAssetIds.has(assetId)),
  }
}
