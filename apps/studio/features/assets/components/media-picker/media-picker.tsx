'use client'

import { confirmAssetUpload } from '@valguide/core/features/assets/actions'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import {
  detectAssetType,
  getAllowedMimeTypes,
  MAX_SIZE_MB,
  validateFileSize,
} from '@valguide/core/features/assets/utils'
import { valguideId } from '@valguide/core/utils/nanoid'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { uploadFileWithTUS } from '../../lib/tus-upload'
import { AssetPickerModal } from '../asset-picker-modal'
import { MediaPickerDropzone } from './media-picker-dropzone'
import { MediaPickerGallery } from './media-picker-gallery'
import { MediaPickerPreview } from './media-picker-preview'
import { MediaPickerProgress } from './media-picker-progress'

export type MediaPickerProps = {
  mode: 'single' | 'multiple'
  mediaTypes: AssetType[]
  value: Asset | Asset[] | null
  onChange: (value: Asset | Asset[] | null) => void
  label?: string
  helperText?: string
  maxFileSize?: number
  organizationId: string
  locale?: string
  showLibrary?: boolean
  disabled?: boolean
}

export function MediaPicker({
  mode,
  mediaTypes,
  value,
  onChange,
  label,
  helperText,
  organizationId,
  locale,
  showLibrary = true,
  disabled = false,
}: MediaPickerProps) {
  const t = useTranslations('assets.mediaPicker')
  const tUpload = useTranslations('assets.upload')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const acceptedMimeTypes = mediaTypes.flatMap((type) => getAllowedMimeTypes(type))

  const handleFileSelect = useCallback(
    async (file: File) => {
      const detected = detectAssetType(file)

      if (!detected) {
        setError(tUpload('unsupportedType'))
        return
      }

      if (!mediaTypes.includes(detected)) {
        setError(tUpload('invalidFileType', { type: mediaTypes[0] ?? 'image' }))
        return
      }

      const maxSizeMB = MAX_SIZE_MB[detected]
      if (!validateFileSize(file.size, detected)) {
        setError(tUpload('fileSizeExceeded', { size: maxSizeMB }))
        return
      }

      setError(null)
      setUploading(true)
      setUploadProgress(0)
      setUploadFileName(file.name)

      try {
        const assetId = valguideId()
        const timestamp = Date.now()
        const fileName = `${organizationId}/${detected}/${timestamp}-${file.name}`

        await uploadFileWithTUS({
          bucketName: 'assets',
          fileName,
          file,
          onProgress: setUploadProgress,
          onError: (err) => setError(err.message),
        })

        const asset = await confirmAssetUpload({
          assetId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          type: detected,
          locale,
          storagePath: fileName,
          organizationId,
        })

        if (asset) {
          if (mode === 'single') {
            onChange(asset)
          } else {
            const currentAssets = Array.isArray(value) ? value : []
            onChange([...currentAssets, asset])
          }
          toast.success(tUpload('success'))
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed'
        setError(errorMessage)
        toast.error(tUpload('error'), { description: errorMessage })
      } finally {
        setUploading(false)
        setUploadFileName(null)
        setUploadProgress(0)
      }
    },
    [mediaTypes, mode, value, onChange, organizationId, locale, tUpload],
  )

  const handleRemove = useCallback(
    (assetId?: string) => {
      if (mode === 'single') {
        onChange(null)
      } else if (assetId && Array.isArray(value)) {
        onChange(value.filter((a) => a.id !== assetId))
      }
    },
    [mode, value, onChange],
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

  const renderContent = () => {
    if (mode === 'single' && uploading) {
      return <MediaPickerProgress progress={uploadProgress} fileName={uploadFileName ?? ''} />
    }

    if (mode === 'single' && value && !Array.isArray(value)) {
      return <MediaPickerPreview asset={value} onRemove={() => handleRemove()} disabled={disabled} />
    }

    if (mode === 'multiple' && (Array.isArray(value) && value.length > 0 || uploading)) {
      return (
        <MediaPickerGallery
          assets={Array.isArray(value) ? value : []}
          onRemove={handleRemove}
          onAdd={handleFileSelect}
          acceptedMimeTypes={acceptedMimeTypes}
          disabled={disabled || uploading}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadFileName={uploadFileName}
        />
      )
    }

    if (uploading) {
      return <MediaPickerProgress progress={uploadProgress} fileName={uploadFileName ?? ''} />
    }

    return (
      <MediaPickerDropzone
        onFileSelect={handleFileSelect}
        acceptedMimeTypes={acceptedMimeTypes}
        disabled={disabled || uploading}
        mediaTypes={mediaTypes}
      />
    )
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}

      {renderContent()}

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {showLibrary && !uploading && (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m16 6 4 14" />
            <path d="M12 6v14" />
            <path d="M8 8v12" />
            <path d="M4 4v16" />
          </svg>
          {t('browseLibrary')}
        </button>
      )}

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

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
    </div>
  )
}
