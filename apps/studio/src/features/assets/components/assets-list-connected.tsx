import { AssetCardConnected } from './asset-card-connected'
import { AssetUploadInline } from './asset-upload-inline'
import { AssetsList, type AssetsListProps } from './assets-list'

type AssetsListConnectedProps = Omit<AssetsListProps, 'AssetCard' | 'UploadInline'>

export function AssetsListConnected(props: AssetsListConnectedProps) {
  return <AssetsList {...props} AssetCard={AssetCardConnected} UploadInline={AssetUploadInline} />
}
