import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import { confirmAssetUploadFn } from '@valguide/core/features/assets/server-functions'
import {
  detectAssetType,
  formatFileSize,
  getAllAllowedMimeTypes,
  getAllowedMimeTypes,
  MAX_SIZE_MB,
  validateFileSize,
} from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { valguideId } from '@valguide/core/utils/nanoid'
import { Button } from '@valguide/ui/components/button'
import { Progress } from '@valguide/ui/components/progress'
import { cn } from '@valguide/ui/lib/utils'
import { CheckCircle2, ImageIcon, Music, Upload, Video, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { uploadFileWithTUS } from '../lib/tus-upload'

export type AssetUploadInlineProps = {
  organizationId: string
  allowedTypes?: AssetType[]
  locale?: string
  onUploadComplete?: (asset: Asset) => void
}

export function AssetUploadInline({ organizationId, allowedTypes, locale, onUploadComplete }: AssetUploadInlineProps) {
  const t = useTranslations('assets')
  const [file, setFile] = useState<File | null>(null)
  const [detectedType, setDetectedType] = useState<AssetType | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSingleTypeMode = allowedTypes?.length === 1
  const singleType: AssetType | null = isSingleTypeMode && allowedTypes[0] ? allowedTypes[0] : null

  const acceptedMimeTypes = allowedTypes
    ? allowedTypes.flatMap((t) => getAllowedMimeTypes(t))
    : getAllAllowedMimeTypes()

  const getTypeIcon = (type: AssetType | null) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-muted-foreground" />
      case 'audio':
        return <Music className="h-10 w-10 text-muted-foreground" />
      case 'video':
        return <Video className="h-10 w-10 text-muted-foreground" />
      default:
        return <Upload className="h-10 w-10 text-muted-foreground" />
    }
  }

  const validateAndSetFile = useCallback(
    (selectedFile: File) => {
      const detected = detectAssetType(selectedFile)

      if (!detected) {
        setError(t('upload.unsupportedType'))
        return
      }

      if (allowedTypes && !allowedTypes.includes(detected)) {
        setError(t('upload.invalidFileType', { type: t(`types.${allowedTypes[0]}`) }))
        return
      }

      const maxSizeMB = MAX_SIZE_MB[detected]
      if (!validateFileSize(selectedFile.size, detected)) {
        setError(t('upload.fileSizeExceeded', { size: maxSizeMB }))
        return
      }

      setDetectedType(detected)
      setFile(selectedFile)
      setError(null)
      setUploadComplete(false)
    },
    [t, allowedTypes],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (!selectedFile) return
      validateAndSetFile(selectedFile)
    },
    [validateAndSetFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (!droppedFile) return
      validateAndSetFile(droppedFile)
    },
    [validateAndSetFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!file || !detectedType) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const assetId = valguideId()
      const timestamp = Date.now()
      const fileName = `${organizationId}/${detectedType}/${timestamp}-${file.name}`

      await uploadFileWithTUS({
        bucketName: 'assets',
        fileName,
        file,
        onProgress: setProgress,
        onError: (err) => setError(err.message),
      })

      const asset = await confirmAssetUploadFn({
        data: {
          assetId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          type: detectedType,
          locale,
          storagePath: fileName,
        },
      })

      if (asset) {
        setUploadComplete(true)
        onUploadComplete?.(asset)

        setTimeout(() => {
          setFile(null)
          setDetectedType(null)
          setProgress(0)
          setUploadComplete(false)
        }, 1500)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      toast.error(t('upload.error'), {
        description: errorMessage,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setDetectedType(null)
    setProgress(0)
    setError(null)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* biome-ignore lint/a11y/useSemanticElements: button cannot support drag/drop events properly */}
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click()
          }
        }}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 transition-all',
          uploadComplete
            ? 'border-green-500 bg-green-50 dark:bg-green-950'
            : file
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMimeTypes.join(',')}
          onChange={handleFileChange}
          disabled={uploading || uploadComplete}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {uploadComplete ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">{t('upload.uploadComplete')}</p>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
              </div>
            </>
          ) : file && detectedType ? (
            <>
              {detectedType === 'image' ? (
                // biome-ignore lint/performance/noImgElement: Using img for dynamic content
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-32 w-auto max-w-full rounded object-contain"
                />
              ) : (
                getTypeIcon(detectedType)
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {t(`types.${detectedType}`)}
                </p>
              </div>
            </>
          ) : (
            <>
              {getTypeIcon(singleType)}
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {singleType ? t('upload.dropzone', { type: t(`types.${singleType}`) }) : t('upload.dropzoneGeneric')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {singleType ? t('upload.maxSize', { size: MAX_SIZE_MB[singleType] }) : t('upload.sizeLimits')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            {t('upload.uploading', { progress: progress.toFixed(1) })}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20 break-words overflow-wrap-anywhere">
          {error}
        </div>
      )}

      {file && detectedType && !uploading && !uploadComplete && (
        <div className="flex gap-2">
          <Button onClick={handleUpload} className="flex-1" size="lg">
            <Upload className="mr-2 h-4 w-4" />
            {t('upload.uploadButton', { type: t(`types.${detectedType}`) })}
          </Button>
          <Button variant="outline" size="lg" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
