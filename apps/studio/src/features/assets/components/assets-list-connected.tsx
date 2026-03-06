import { AssetCardConnected } from './asset-card-connected'
import { AssetListRowConnected } from './asset-list-row-connected'
import { AssetUploadInline } from './asset-upload-inline'
import { AssetsList, type AssetsListProps } from './assets-list'

type AssetsListConnectedProps = Omit<AssetsListProps, 'AssetCard' | 'AssetListRow' | 'UploadInline'>

export function AssetsListConnected(props: AssetsListConnectedProps) {
  return (
    <AssetsList
      {...props}
      AssetCard={AssetCardConnected}
      AssetListRow={AssetListRowConnected}
      UploadInline={AssetUploadInline}
    />
  )
}
