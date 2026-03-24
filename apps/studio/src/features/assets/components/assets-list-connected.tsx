import { renameAssetFn } from '@valguide/core/features/assets/rename-asset.fn'
import { AssetCardConnected } from './asset-card-connected'
import { AssetListRowConnected } from './asset-list-row-connected'
import { AssetsList, type AssetsListProps } from './assets-list'
import { BulkDeleteAssetsDialogConnected } from './bulk-delete-assets-dialog-connected'

type AssetsListConnectedProps = Omit<AssetsListProps, 'AssetCard' | 'AssetListRow' | 'onRenameAssetAction'>

export function AssetsListConnected(props: AssetsListConnectedProps) {
  const handleRenameAssetAction: NonNullable<AssetsListProps['onRenameAssetAction']> = async (data) =>
    renameAssetFn({ data })

  return (
    <AssetsList
      {...props}
      AssetCard={AssetCardConnected}
      AssetListRow={AssetListRowConnected}
      BulkDeleteDialog={BulkDeleteAssetsDialogConnected}
      onRenameAssetAction={handleRenameAssetAction}
    />
  )
}
