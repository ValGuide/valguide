import { AssetPickerModal, type AssetPickerModalProps } from './asset-picker-modal'
import { AssetUploadInline } from './asset-upload-inline'

type AssetPickerModalConnectedProps = Omit<AssetPickerModalProps, 'UploadInline'>

export function AssetPickerModalConnected(props: AssetPickerModalConnectedProps) {
  return <AssetPickerModal {...props} UploadInline={AssetUploadInline} />
}
