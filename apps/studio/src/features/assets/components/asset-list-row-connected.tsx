import { deleteAssetFn } from '@valguide/core/features/assets/delete-asset.fn'
import { AssetListRow, type AssetListRowProps } from './asset-list-row'
import { DeleteAssetDialogConnected } from './delete-asset-dialog-connected'

type AssetListRowConnectedProps = Omit<AssetListRowProps, 'onDeleteAction' | 'DeleteDialog'>

export function AssetListRowConnected(props: AssetListRowConnectedProps) {
  const handleDeleteAction = async (assetId: string) => {
    await deleteAssetFn({ data: { assetId } })
  }

  return <AssetListRow {...props} onDeleteAction={handleDeleteAction} DeleteDialog={DeleteAssetDialogConnected} />
}
