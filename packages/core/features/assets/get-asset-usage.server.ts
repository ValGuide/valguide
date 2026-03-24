import { NotFoundError } from '../auth/authorization'
import { type AssetUsageLocation, getAssetDeletionEligibility } from './asset-deletion-eligibility.server'

// =============================================================================
// TYPES
// =============================================================================

export type AssetUsageDetails = {
  tours: AssetUsageLocation[]
  stops: AssetUsageLocation[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssetUsage(assetId: string): Promise<AssetUsageDetails> {
  const [eligibility] = await getAssetDeletionEligibility([assetId])

  if (!eligibility) {
    throw new NotFoundError('Asset')
  }

  return {
    tours: eligibility.tours,
    stops: eligibility.stops,
  }
}
