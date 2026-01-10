import type { Asset } from '@valguide/core/features/assets/schema'
import { detectAssetType } from '@valguide/core/features/assets/utils'
import { valguideId } from '@valguide/core/utils/nanoid'
import { useCallback, useState } from 'react'
import { uploadFileWithTUS } from '../../lib/tus-upload'
import { AssetPickerModal } from '../asset-picker-modal'
import { MediaPicker } from './media-picker'
import type { MediaPickerComponentProps } from './types'

export function MediaPickerConnected({
  organizationId,
  locale,
  mode,
  mediaTypes,
  value,
  onChange,
  showLibrary = true,
  ...props
}: MediaPickerComponentProps) {
  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleUpload = useCallback(
    async (file: File, onProgress: (progress: number) => void): Promise<Asset | null> => {
      const detected = detectAssetType(file)
      if (!detected) return null

      const assetId = valguideId()
      const timestamp = Date.now()
      const fileName = `${organizationId}/${detected}/${timestamp}-${file.name}`

      await uploadFileWithTUS({
        bucketName: 'assets',
        fileName,
        file,
        onProgress,
        onError: (err) => {
          throw err
        },
      })

      const { confirmAssetUploadFn } = await import('@valguide/core/features/assets/server-functions')
      const asset = await confirmAssetUploadFn({
        data: {
          assetId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          type: detected,
          locale,
          storagePath: fileName,
          organizationId,
        },
      })

      return asset
    },
    [organizationId, locale],
  )

  const handleLibrarySelect = useCallback(
    (assets: Asset[]) => {
      if (mode === 'single') {
        onChange(assets[0] ?? null)
      } else {
        const currentAssets = Array.isArray(value) ? value : []
        const newAssetIds = new Set(assets.map((a) => a.id))
        const filtered = currentAssets.filter((a) => !newAssetIds.has(a.id))
        onChange([...filtered, ...assets])
      }
      setLibraryOpen(false)
    },
    [mode, value, onChange],
  )

  return (
    <MediaPicker
      {...props}
      mode={mode}
      mediaTypes={mediaTypes}
      value={value}
      onChange={onChange}
      showLibrary={showLibrary}
      onUpload={handleUpload}
      onBrowseLibrary={showLibrary ? () => setLibraryOpen(true) : undefined}
      libraryContent={
        showLibrary ? (
          <AssetPickerModal
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            type={mediaTypes[0] ?? 'image'}
            locale={locale}
            organizationId={organizationId}
            multiple={mode === 'multiple'}
            selectedAssetIds={Array.isArray(value) ? value.map((a) => a.id) : value ? [value.id] : []}
            onSelect={handleLibrarySelect}
          />
        ) : undefined
      }
    />
  )
}
