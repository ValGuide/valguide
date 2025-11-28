'use client'

import { type AssetType, confirmAssetUpload } from '@valguide/core/features/assets/actions'
import type { Asset } from '@valguide/core/features/assets/schema'
import { getAllowedMimeTypes, validateFile, validateFileSize } from '@valguide/core/features/assets/utils'
import { Button } from '@valguide/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Progress } from '@valguide/ui/components/progress'
import { cn } from '@valguide/ui/lib/utils'
import { CheckCircle2, FileIcon, ImageIcon, Music, Upload, Video, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { uploadFileWithTUS } from '../lib/tus-upload'

export type CustomAssetUploadProps = {
  type: AssetType
  locale?: string
  organizationId: string
  onUploadComplete?: (asset: Asset) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CustomAssetUpload({
  type,
  locale,
  organizationId,
  onUploadComplete,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CustomAssetUploadProps) {
  const t = useTranslations('assets')
  const [internalOpen, setInternalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = controlledOnOpenChange || setInternalOpen

  const maxSizeMB = type === 'video' ? 500 : type === 'audio' ? 50 : 10
  const allowedTypes = getAllowedMimeTypes(type)
  const translatedType = t(`types.${type}`)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-muted-foreground" />
      case 'audio':
        return <Music className="h-10 w-10 text-muted-foreground" />
      case 'video':
        return <Video className="h-10 w-10 text-muted-foreground" />
      default:
        return <FileIcon className="h-10 w-10 text-muted-foreground" />
    }
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (!selectedFile) return

      // Validate file type
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(t('upload.invalidFileType', { type: translatedType }))
        return
      }

      // Validate file size
      if (!validateFileSize(selectedFile.size, type)) {
        setError(t('upload.fileSizeExceeded', { size: maxSizeMB }))
        return
      }

      setFile(selectedFile)
      setError(null)
      setUploadComplete(false)

      // Create preview for images
      if (type === 'image' && selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
      }
    },
    [allowedTypes, maxSizeMB, type, t, translatedType],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (!droppedFile) return

      // Validate file type
      if (!allowedTypes.includes(droppedFile.type)) {
        setError(t('upload.invalidFileType', { type: translatedType }))
        return
      }

      // Validate file size
      if (!validateFileSize(droppedFile.size, type)) {
        setError(t('upload.fileSizeExceeded', { size: maxSizeMB }))
        return
      }

      setFile(droppedFile)
      setError(null)
      setUploadComplete(false)

      // Create preview for images
      if (type === 'image' && droppedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(droppedFile)
        setPreviewUrl(url)
      }
    },
    [allowedTypes, maxSizeMB, type, t, translatedType],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const assetId = nanoid()
      const { sanitizedName } = validateFile(file.name)
      const localePrefix = locale ? `${locale}/` : ''

      // Consistent path structure: {orgId}/{type}s/{locale?}/{assetId}-{sanitizedName}
      const fileName = `${organizationId}/${type}s/${localePrefix}${assetId}-${sanitizedName}`

      // Upload file with TUS
      await uploadFileWithTUS({
        bucketName: 'assets',
        fileName,
        file,
        onProgress: setProgress,
        onError: (err) => setError(err.message),
      })

      // Confirm upload and save to database
      const asset = await confirmAssetUpload({
        assetId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        type,
        locale,
        storagePath: fileName,
        organizationId,
      })

      if (asset) {
        setUploadComplete(true)
        toast.success(t('upload.success'), {
          description: `${file.name} uploaded successfully`,
        })
        onUploadComplete?.(asset)

        // Reset after a short delay
        setTimeout(() => {
          setFile(null)
          setProgress(0)
          setUploadComplete(false)
          setIsOpen(false)
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
    setProgress(0)
    setError(null)
    setUploadComplete(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <>
      {controlledOpen === undefined && (
        <Button onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4" />
          {t('upload.uploadButton', { type: translatedType })}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {t('upload.title', { type: translatedType })} {locale && `(${locale.toUpperCase()})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Zone - uses div for native drag/drop support with file input overlay */}
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
                'relative border-2 border-dashed rounded-lg p-6 sm:p-12 transition-all',
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
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                disabled={uploading || uploadComplete}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
                {uploadComplete ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
                        {t('upload.uploadComplete')}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[250px] sm:max-w-none">
                        {file?.name}
                      </p>
                    </div>
                  </>
                ) : file ? (
                  <>
                    {previewUrl ? (
                      // biome-ignore lint/performance/noImgElement: Using img for dynamic content
                      <img src={previewUrl} alt={file.name} className="max-h-48 max-w-full rounded-lg object-contain" />
                    ) : (
                      getTypeIcon()
                    )}
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium truncate max-w-[250px] sm:max-w-none">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    {getTypeIcon()}
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-sm sm:text-base font-medium">
                        {t('upload.dropzone', { type: translatedType })}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('upload.maxSize', { size: maxSizeMB })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {t('upload.uploading', { progress: progress.toFixed(1) })}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-md border border-destructive/30 bg-destructive/5">
                <p className="text-sm font-medium text-destructive">{t('upload.error')}</p>
                <p className="mt-1 text-sm text-muted-foreground break-words overflow-wrap-anywhere">{error}</p>
              </div>
            )}

            {/* Actions */}
            {file && !uploading && !uploadComplete && (
              <div className="flex gap-2">
                <Button onClick={handleUpload} className="flex-1" size="lg">
                  <Upload />
                  {t('upload.uploadButton', { type: translatedType })}
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset} className="shrink-0">
                  <X />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
