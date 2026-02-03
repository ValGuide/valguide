import { publishStopAssetsFn } from '@valguide/core/features/tours/stop/asset/publish-stop-assets.fn'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditPage } from './stop-edit-page'

async function handlePublishAssets(nanoId: string, activeLocale: string) {
  await publishStopAssetsFn({ data: { nanoId, channel: 'images.gallery', locale: null } })
  await publishStopAssetsFn({ data: { nanoId, channel: 'audio.narration', locale: activeLocale } })
}

export function StopEditPageConnected() {
  return <StopEditPage MediaPicker={MediaPickerConnected} onPublishAssets={handlePublishAssets} />
}
