import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import {
  detectAssetType,
  formatFileSize,
  getAllAllowedMimeTypes,
  getAllowedMimeTypes,
  MAX_SIZE_MB,
  validateFileSize,
} from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { Button } from '@valguide/ui/components/button'
import { Progress } from '@valguide/ui/components/progress'
import { cn } from '@valguide/ui/lib/utils'
import { CheckCircle2, FileText, FileWarning, ImageIcon, Music, Upload, Video, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadFile } from '../lib/upload'

type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error'

type UploadQueueItem = {
  id: string
  file: File
  type: AssetType
  previewUrl: string | null
  progress: number
  status: UploadStatus
  error: string | null
}

export type AssetUploadInlineProps = {
  organizationId: string
  allowedTypes?: AssetType[]
  locale?: string
  onUploadComplete?: (asset: Asset) => void
  onUploadBatchComplete?: (assets: Asset[], meta: { hasErrors: boolean }) => void
  className?: string
  onConfirmUpload?: (input: {
    assetId: string
    fileName: string
    fileSize: number
    mimeType: string
    type: AssetType
    storagePath: string
  }) => Promise<Asset>
}

export function AssetUploadInline({
  allowedTypes,
  onUploadComplete,
  onUploadBatchComplete,
  className,
  onConfirmUpload,
}: AssetUploadInlineProps) {
  const t = useTranslations('assets')
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<UploadQueueItem[]>([])

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
      case 'document':
        return <FileText className="h-10 w-10 text-muted-foreground" />
      default:
        return <Upload className="h-10 w-10 text-muted-foreground" />
    }
  }

  const updateQueueItem = useCallback((itemId: string, updater: (item: UploadQueueItem) => UploadQueueItem) => {
    setQueue((currentQueue) => currentQueue.map((item) => (item.id === itemId ? updater(item) : item)))
  }, [])

  const createQueueItem = useCallback(
    (selectedFile: File): UploadQueueItem => {
      const detected = detectAssetType(selectedFile)

      if (!detected) {
        return {
          id: valguideId(),
          file: selectedFile,
          type: 'image',
          previewUrl: null,
          progress: 0,
          status: 'error',
          error: t('upload.unsupportedType'),
        }
      }

      if (allowedTypes && !allowedTypes.includes(detected)) {
        return {
          id: valguideId(),
          file: selectedFile,
          type: detected,
          previewUrl: detected === 'image' ? URL.createObjectURL(selectedFile) : null,
          progress: 0,
          status: 'error',
          error: t('upload.invalidFileType', { type: t(`types.${allowedTypes[0]}`) }),
        }
      }

      const maxSizeMB = MAX_SIZE_MB[detected]
      if (!validateFileSize(selectedFile.size, detected)) {
        return {
          id: valguideId(),
          file: selectedFile,
          type: detected,
          previewUrl: detected === 'image' ? URL.createObjectURL(selectedFile) : null,
          progress: 0,
          status: 'error',
          error: t('upload.fileSizeExceeded', { size: maxSizeMB }),
        }
      }

      return {
        id: valguideId(),
        file: selectedFile,
        type: detected,
        previewUrl: detected === 'image' ? URL.createObjectURL(selectedFile) : null,
        progress: 0,
        status: 'pending',
        error: null,
      }
    },
    [t, allowedTypes],
  )

  const appendFiles = useCallback(
    (selectedFiles: File[]) => {
      const nextItems = selectedFiles.map(createQueueItem)
      setQueue((currentQueue) => [...currentQueue, ...nextItems])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [createQueueItem],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? [])
      if (selectedFiles.length === 0) {
        return
      }
      appendFiles(selectedFiles)
    },
    [appendFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFiles = Array.from(e.dataTransfer.files ?? [])
      if (droppedFiles.length === 0) {
        return
      }
      appendFiles(droppedFiles)
    },
    [appendFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    const pendingItems = queueRef.current.filter((item) => item.status === 'pending')
    if (pendingItems.length === 0) {
      return
    }

    setUploading(true)
    const uploadedAssets: Asset[] = []
    let hasErrors = false

    try {
      for (const item of pendingItems) {
        updateQueueItem(item.id, (currentItem) => ({
          ...currentItem,
          status: 'uploading',
          progress: 0,
          error: null,
        }))

        try {
          const assetId = valguideId()
          const fileId = valguideId()
          const ext = item.file.name.split('.').pop()?.toLowerCase() ?? 'bin'
          const fileName = `assets/${assetId}/${fileId}.${ext}`

          await uploadFile({
            key: fileName,
            file: item.file,
            onProgress: (progress) => {
              updateQueueItem(item.id, (currentItem) => ({
                ...currentItem,
                progress,
              }))
            },
          })

          if (!onConfirmUpload) {
            throw new Error('Missing onConfirmUpload handler')
          }

          const asset = await onConfirmUpload({
            assetId,
            fileName: item.file.name,
            fileSize: item.file.size,
            mimeType: item.file.type,
            type: item.type,
            storagePath: fileName,
          })

          uploadedAssets.push(asset)
          onUploadComplete?.(asset)

          updateQueueItem(item.id, (currentItem) => ({
            ...currentItem,
            status: 'complete',
            progress: 100,
            error: null,
          }))
        } catch (err) {
          hasErrors = true
          const errorMessage = err instanceof Error ? err.message : t('upload.error')
          updateQueueItem(item.id, (currentItem) => ({
            ...currentItem,
            status: 'error',
            error: errorMessage,
          }))
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      toast.error(t('upload.error'), {
        description: errorMessage,
      })
    } finally {
      setUploading(false)
    }

    if (uploadedAssets.length > 0) {
      onUploadBatchComplete?.(uploadedAssets, { hasErrors })
    }

    if (hasErrors) {
      toast.error(t('upload.partialFailure'), {
        description: t('upload.partialFailureDescription'),
      })
      return
    }

    toast.success(t('upload.uploadCompleteBatch', { count: uploadedAssets.length }))
    handleReset()
  }

  const revokePreviewUrl = useCallback((previewUrl: string | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [])

  const handleRemove = useCallback(
    (itemId: string) => {
      setQueue((currentQueue) => {
        const itemToRemove = currentQueue.find((item) => item.id === itemId)
        if (itemToRemove) {
          revokePreviewUrl(itemToRemove.previewUrl)
        }
        return currentQueue.filter((item) => item.id !== itemId)
      })
    },
    [revokePreviewUrl],
  )

  const handleReset = useCallback(() => {
    queueRef.current.forEach((item) => {
      revokePreviewUrl(item.previewUrl)
    })
    setQueue([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [revokePreviewUrl])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        revokePreviewUrl(item.previewUrl)
      })
    }
  }, [revokePreviewUrl])

  const pendingCount = queue.filter((item) => item.status === 'pending').length
  const uploadingItem = queue.find((item) => item.status === 'uploading') ?? null
  const activeUploadIndex = uploadingItem ? queue.filter((item) => item.status === 'complete').length + 1 : 0

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-4', className)}>
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
          'relative flex min-h-0 flex-1 items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all sm:p-12',
          'border-border hover:border-primary/50 hover:bg-accent/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedMimeTypes.join(',')}
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-3 text-center sm:space-y-4">
          {getTypeIcon(singleType)}

          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-sm font-medium sm:text-base">
              {singleType ? t('upload.dropzone', { type: t(`types.${singleType}`) }) : t('upload.dropzoneGeneric')}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {singleType ? t('upload.maxSize', { size: MAX_SIZE_MB[singleType] }) : t('upload.sizeLimits')}
            </p>
          </div>
        </div>
      </div>

      {queue.length > 0 ? (
        <>
          {uploadingItem ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{uploadingItem.file.name}</p>
                <span className="text-xs text-muted-foreground">
                  {t('upload.uploadingMultiple', {
                    current: activeUploadIndex,
                    total: queue.length,
                  })}
                </span>
              </div>
              <Progress value={uploadingItem.progress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {t('upload.uploading', { progress: uploadingItem.progress.toFixed(1) })}
              </p>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t('upload.queueTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('upload.queueDescription')}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={uploading}>
                {t('upload.clearSelection')}
              </Button>
            </div>

            <div className="max-h-[24rem] overflow-y-auto">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {item.type === 'image' && item.previewUrl ? (
                      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                    ) : (
                      getTypeIcon(item.type)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{item.file.name}</p>
                      {item.status === 'complete' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      ) : item.status === 'error' ? (
                        <FileWarning className="h-4 w-4 shrink-0 text-destructive" />
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(item.file.size)}</span>
                      <span>·</span>
                      <span>{t(`types.${item.type}`)}</span>
                      <span>·</span>
                      <span>
                        {item.status === 'pending'
                          ? t('upload.ready')
                          : item.status === 'uploading'
                            ? t('upload.uploadingLabel')
                            : item.status === 'complete'
                              ? t('upload.uploaded')
                              : t('upload.failed')}
                      </span>
                    </div>
                    {item.status === 'uploading' ? <Progress value={item.progress} className="mt-2 h-1.5" /> : null}
                    {item.error ? <p className="mt-1 text-xs text-destructive">{item.error}</p> : null}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleRemove(item.id)}
                    disabled={uploading}
                    aria-label={t('upload.removeFile')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('upload.addMore')}
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              className="min-h-12 flex-1 sm:min-h-11"
              size="lg"
              disabled={uploading || pendingCount === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('upload.uploadButtonMultiple', { count: pendingCount })}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
