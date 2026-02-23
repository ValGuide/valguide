import { useQueryClient } from '@tanstack/react-query'
import { confirmAssetUploadFn } from '@valguide/core/features/assets/confirm-upload.fn'
import type { Asset } from '@valguide/core/features/assets/types'
import { detectAssetType } from '@valguide/core/features/assets/utils'
import { valguideId } from '@valguide/core/utils/nanoid'
import { useCallback, useState } from 'react'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { uploadFile } from '../../lib/upload'
import { AssetPickerModalConnected } from '../asset-picker-modal-connected'
import { MediaPicker } from './media-picker'
import type { MediaPickerComponentProps } from './types'

export function MediaPickerConnected({
  locale,
  mode,
  mediaTypes,
  value,
  onChange,
  showLibrary = true,
  ...props
}: MediaPickerComponentProps) {
  const queryClient = useQueryClient()
  const { data: sidebarData } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''
  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleUpload = useCallback(
    async (file: File, onProgress: (progress: number) => void): Promise<Asset | null> => {
      const detected = detectAssetType(file)
      if (!detected) return null

      const assetId = valguideId()
      const fileId = valguideId()
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
      const fileName = `assets/${assetId}/${fileId}.${ext}`

      await uploadFile({
        key: fileName,
        file,
        onProgress,
        onError: (err) => {
          throw err
        },
      })

      const asset = await confirmAssetUploadFn({
        data: {
          assetId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          type: detected,
          storagePath: fileName,
        },
      })

      // Invalidate all asset queries regardless of type/locale filters
      await queryClient.invalidateQueries({ queryKey: ['assets'] })

      return asset
    },
    [organizationId, queryClient],
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
          <AssetPickerModalConnected
            organizationId={organizationId}
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            type={mediaTypes[0] ?? 'image'}
            locale={locale}
            multiple={mode === 'multiple'}
            selectedAssetIds={Array.isArray(value) ? value.map((a) => a.id) : value ? [value.id] : []}
            onSelect={handleLibrarySelect}
          />
        ) : undefined
      }
    />
  )
}
