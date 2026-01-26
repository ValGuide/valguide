import { getAssetUsageDetailsFn } from '@valguide/core/features/assets/get-asset-usage.fn'
import type { DeleteAssetDialogComponentProps } from './asset-card'
import { DeleteAssetDialog } from './delete-asset-dialog'

export function DeleteAssetDialogConnected(props: DeleteAssetDialogComponentProps) {
  const handleGetUsage = async (assetId: string) => {
    return await getAssetUsageDetailsFn({ data: { assetId } })
  }

  return <DeleteAssetDialog {...props} onGetUsage={handleGetUsage} />
}
