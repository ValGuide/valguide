import { renameAssetFn } from '@valguide/core/features/assets/rename-asset.fn'
import { AssetCardConnected } from './asset-card-connected'
import { AssetListRowConnected } from './asset-list-row-connected'
import { AssetUploadInlineConnected } from './asset-upload-inline-connected'
import { AssetsList, type AssetsListProps } from './assets-list'

type AssetsListConnectedProps = Omit<
  AssetsListProps,
  'AssetCard' | 'AssetListRow' | 'UploadInline' | 'onRenameAssetAction'
>

export function AssetsListConnected(props: AssetsListConnectedProps) {
  const handleRenameAssetAction: NonNullable<AssetsListProps['onRenameAssetAction']> = async (data) =>
    renameAssetFn({ data })

  return (
    <AssetsList
      {...props}
      AssetCard={AssetCardConnected}
      AssetListRow={AssetListRowConnected}
      UploadInline={AssetUploadInlineConnected}
      onRenameAssetAction={handleRenameAssetAction}
    />
  )
}
