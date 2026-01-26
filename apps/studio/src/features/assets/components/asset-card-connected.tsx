import { deleteAssetFn } from '@valguide/core/features/assets/delete-asset'
import { AssetCard, type AssetCardProps } from './asset-card'
import { DeleteAssetDialogConnected } from './delete-asset-dialog-connected'

type AssetCardConnectedProps = Omit<AssetCardProps, 'onDeleteAction' | 'DeleteDialog'>

export function AssetCardConnected(props: AssetCardConnectedProps) {
  const handleDeleteAction = async (assetId: string) => {
    await deleteAssetFn({ data: { assetId } })
  }

  return <AssetCard {...props} onDeleteAction={handleDeleteAction} DeleteDialog={DeleteAssetDialogConnected} />
}
