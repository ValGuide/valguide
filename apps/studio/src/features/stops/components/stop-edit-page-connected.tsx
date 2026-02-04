import { publishStopAssetsFn } from '@valguide/core/features/tours/stop/asset/publish-stop-assets.fn'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'
import { stopLocaleDiffQueryOptions } from '@/features/tours/query-options'
import { StopEditPage } from './stop-edit-page'

async function handlePublishAssets(nanoId: string, activeLocale: string) {
  await publishStopAssetsFn({ data: { nanoId, channel: 'images.gallery', locale: null } })
  await publishStopAssetsFn({ data: { nanoId, channel: 'audio.narration', locale: activeLocale } })
}

export function StopEditPageConnected() {
  const { nanoId, activeLocale } = useStopEditor()

  return (
    <StopEditPage
      MediaPicker={MediaPickerConnected}
      onPublishAssets={handlePublishAssets}
      diffQueryOptions={stopLocaleDiffQueryOptions(nanoId, activeLocale)}
    />
  )
}
