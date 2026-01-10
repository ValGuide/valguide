import { useAssetsContextOptional } from '../context/assets-context'
import { useAssets } from '../hooks/use-assets'
import { AssetPickerModal, type AssetPickerModalProps } from './asset-picker-modal'
import { AssetUploadInline } from './asset-upload-inline'

type AssetPickerModalConnectedProps = Omit<AssetPickerModalProps, 'assets' | 'isLoading' | 'onRefetch' | 'UploadInline'>

export function AssetPickerModalConnected({ type, locale, organizationId, ...props }: AssetPickerModalConnectedProps) {
  const contextValue = useAssetsContextOptional()
  const shouldFetchAssets = !contextValue

  const {
    assets: assetsFromHook,
    isLoading: isLoadingFromHook,
    refetch: refetchFromHook,
  } = useAssets({ type, locale, organizationId, enabled: shouldFetchAssets })

  const assets = contextValue?.assets ?? assetsFromHook
  const isLoading = contextValue?.isLoading ?? isLoadingFromHook
  const refetch = contextValue?.refetch ?? refetchFromHook

  return (
    <AssetPickerModal
      {...props}
      type={type}
      locale={locale}
      organizationId={organizationId}
      assets={assets}
      isLoading={isLoading}
      onRefetch={refetch}
      UploadInline={AssetUploadInline}
    />
  )
}
