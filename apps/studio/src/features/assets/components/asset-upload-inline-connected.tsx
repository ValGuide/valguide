import { confirmAssetUploadFn } from '@valguide/core/features/assets/confirm-upload.fn'
import { AssetUploadInline, type AssetUploadInlineProps } from './asset-upload-inline'

type AssetUploadInlineConnectedProps = Omit<AssetUploadInlineProps, 'onConfirmUpload'>

export function AssetUploadInlineConnected(props: AssetUploadInlineConnectedProps) {
  const handleConfirmUpload: NonNullable<AssetUploadInlineProps['onConfirmUpload']> = async (data) =>
    confirmAssetUploadFn({ data })

  return <AssetUploadInline {...props} onConfirmUpload={handleConfirmUpload} />
}
