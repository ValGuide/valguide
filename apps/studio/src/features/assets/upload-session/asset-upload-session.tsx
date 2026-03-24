import { useQueryClient } from '@tanstack/react-query'
import { confirmAssetUploadFn } from '@valguide/core/features/assets/confirm-upload.fn'
import {
  detectAssetType,
  getAllAllowedMimeTypes,
  MAX_SIZE_MB,
  validateFileSize,
} from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { valguideId } from '@valguide/core/utils/nanoid'
import type { PropsWithChildren } from 'react'
import * as React from 'react'
import { uploadFile } from '../lib/upload'
import { getAggregateUploadProgress, getUploadCounts, isFileDrag } from './asset-upload-session.utils'
import {
  type AssetUploadItem,
  AssetUploadSessionContext,
  type AssetUploadSessionContextValue,
} from './asset-upload-session-context'
import { AssetsGlobalDropOverlay } from './assets-global-drop-overlay'
import { AssetsUploadSurface } from './assets-upload-surface'

const MAX_CONCURRENT_UPLOADS = 2
const AUTO_COLLAPSE_DELAY_MS = 2400

export function AssetUploadSessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const t = useTranslations('assets')
  const [items, setItems] = React.useState<AssetUploadItem[]>([])
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isHidden, setIsHidden] = React.useState(false)
  const [isDragActive, setIsDragActive] = React.useState(false)
  const itemsRef = React.useRef<AssetUploadItem[]>([])
  const pendingStartIdsRef = React.useRef(new Set<string>())
  const dragDepthRef = React.useRef(0)
  const autoCollapseTimeoutRef = React.useRef<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    itemsRef.current = items
  }, [items])

  const revokePreviewUrl = React.useCallback((previewUrl: string | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [])

  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        revokePreviewUrl(item.previewUrl)
      })
    }
  }, [revokePreviewUrl])

  const invalidateAssetsQueries = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
  }, [queryClient])

  const openFilePicker = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const createUploadItem = React.useCallback(
    (file: File): AssetUploadItem => {
      const type = detectAssetType(file)

      if (!type) {
        return {
          id: valguideId(),
          file,
          type: 'image',
          previewUrl: null,
          status: 'error',
          progress: 0,
          error: t('upload.unsupportedType'),
          asset: null,
          createdAt: Date.now(),
        }
      }

      if (!validateFileSize(file.size, type)) {
        return {
          id: valguideId(),
          file,
          type,
          previewUrl: type === 'image' ? URL.createObjectURL(file) : null,
          status: 'error',
          progress: 0,
          error: t('upload.fileSizeExceeded', { size: MAX_SIZE_MB[type] }),
          asset: null,
          createdAt: Date.now(),
        }
      }

      return {
        id: valguideId(),
        file,
        type,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : null,
        status: 'queued',
        progress: 0,
        error: null,
        asset: null,
        createdAt: Date.now(),
      }
    },
    [t],
  )

  const addFiles = React.useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return
      }

      if (autoCollapseTimeoutRef.current) {
        window.clearTimeout(autoCollapseTimeoutRef.current)
        autoCollapseTimeoutRef.current = null
      }

      const nextItems = files.map(createUploadItem)
      setItems((currentItems) => [...nextItems, ...currentItems])
      setIsHidden(false)
      setIsExpanded(window.innerWidth >= 768)
    },
    [createUploadItem],
  )

  const dismissItem = React.useCallback(
    (itemId: string) => {
      setItems((currentItems) => {
        const item = currentItems.find((candidate) => candidate.id === itemId)
        if (item) {
          revokePreviewUrl(item.previewUrl)
        }
        return currentItems.filter((candidate) => candidate.id !== itemId)
      })
    },
    [revokePreviewUrl],
  )

  const clearCompleted = React.useCallback(() => {
    setItems((currentItems) => {
      const remainingItems = currentItems.filter((item) => {
        if (item.status === 'complete') {
          revokePreviewUrl(item.previewUrl)
          return false
        }

        return true
      })

      return remainingItems
    })
  }, [revokePreviewUrl])

  const retryItem = React.useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'queued',
              progress: 0,
              error: null,
              asset: null,
            }
          : item,
      ),
    )
    setIsHidden(false)
    setIsExpanded(true)
  }, [])

  const closeSurface = React.useCallback(() => {
    setIsExpanded(false)
    setIsHidden(true)
  }, [])

  const processUploadItem = React.useCallback(
    async (itemId: string) => {
      if (pendingStartIdsRef.current.has(itemId)) {
        return
      }

      const nextItem = itemsRef.current.find((item) => item.id === itemId)
      if (!nextItem || nextItem.status !== 'queued') {
        return
      }

      pendingStartIdsRef.current.add(itemId)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: 'uploading',
                progress: 0,
                error: null,
              }
            : item,
        ),
      )

      try {
        const assetId = valguideId()
        const fileId = valguideId()
        const extension = nextItem.file.name.split('.').pop()?.toLowerCase() ?? 'bin'
        const storagePath = `assets/${assetId}/${fileId}.${extension}`

        await uploadFile({
          key: storagePath,
          file: nextItem.file,
          onProgress: (progress) => {
            setItems((currentItems) =>
              currentItems.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      progress,
                    }
                  : item,
              ),
            )
          },
        })

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'confirming',
                  progress: 100,
                }
              : item,
          ),
        )

        const asset = await confirmAssetUploadFn({
          data: {
            assetId,
            fileName: nextItem.file.name,
            fileSize: nextItem.file.size,
            mimeType: nextItem.file.type,
            type: nextItem.type,
            storagePath,
          },
        })

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'complete',
                  progress: 100,
                  error: null,
                  asset,
                }
              : item,
          ),
        )

        await invalidateAssetsQueries()
      } catch (error) {
        const message = error instanceof Error ? error.message : t('upload.error')

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'error',
                  error: message,
                }
              : item,
          ),
        )
        setIsHidden(false)
        setIsExpanded(true)
      } finally {
        pendingStartIdsRef.current.delete(itemId)
      }
    },
    [invalidateAssetsQueries, t],
  )

  React.useEffect(() => {
    const activeCount = items.filter((item) => item.status === 'uploading' || item.status === 'confirming').length
    const availableSlots = MAX_CONCURRENT_UPLOADS - activeCount

    if (availableSlots <= 0) {
      return
    }

    const nextQueuedItems = items.filter((item) => item.status === 'queued').slice(0, availableSlots)

    nextQueuedItems.forEach((item) => {
      void processUploadItem(item.id)
    })
  }, [items, processUploadItem])

  React.useEffect(() => {
    if (autoCollapseTimeoutRef.current) {
      window.clearTimeout(autoCollapseTimeoutRef.current)
      autoCollapseTimeoutRef.current = null
    }

    const counts = getUploadCounts(items)
    const hasActiveUploads = counts.active > 0 || counts.queued > 0

    if (!hasActiveUploads && counts.error === 0 && counts.complete > 0) {
      autoCollapseTimeoutRef.current = window.setTimeout(() => {
        setIsExpanded(false)
      }, AUTO_COLLAPSE_DELAY_MS)
    }

    return () => {
      if (autoCollapseTimeoutRef.current) {
        window.clearTimeout(autoCollapseTimeoutRef.current)
        autoCollapseTimeoutRef.current = null
      }
    }
  }, [items])

  React.useEffect(() => {
    const hasErrors = items.some((item) => item.status === 'error')

    if (hasErrors && isHidden) {
      setIsHidden(false)
      setIsExpanded(true)
    }
  }, [isHidden, items])

  React.useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      if (!isFileDrag(event.dataTransfer?.types)) {
        return
      }

      event.preventDefault()
      dragDepthRef.current += 1
      setIsDragActive(true)
    }

    const handleDragOver = (event: DragEvent) => {
      if (!isFileDrag(event.dataTransfer?.types)) {
        return
      }

      event.preventDefault()
      if (!isDragActive) {
        setIsDragActive(true)
      }
    }

    const handleDragLeave = (event: DragEvent) => {
      if (!isFileDrag(event.dataTransfer?.types)) {
        return
      }

      event.preventDefault()
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
      if (dragDepthRef.current === 0) {
        setIsDragActive(false)
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (!isFileDrag(event.dataTransfer?.types)) {
        return
      }

      event.preventDefault()
      dragDepthRef.current = 0
      setIsDragActive(false)
      addFiles(Array.from(event.dataTransfer?.files ?? []))
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dragDepthRef.current = 0
        setIsDragActive(false)
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [addFiles, isDragActive])

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? [])
      addFiles(selectedFiles)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [addFiles],
  )

  const aggregateProgress = React.useMemo(
    () =>
      getAggregateUploadProgress(
        items.map((item) => ({
          status: item.status,
          progress: item.progress,
          type: item.type,
        })),
      ),
    [items],
  )

  const contextValue = React.useMemo<AssetUploadSessionContextValue>(
    () => ({
      items,
      isExpanded,
      isDragActive,
      hasVisibleUploads: items.length > 0 && !isHidden,
      aggregateProgress,
      openFilePicker,
      setExpanded: setIsExpanded,
      closeSurface,
      dismissItem,
      retryItem,
      clearCompleted,
    }),
    [
      aggregateProgress,
      clearCompleted,
      closeSurface,
      dismissItem,
      isDragActive,
      isExpanded,
      isHidden,
      items,
      openFilePicker,
      retryItem,
    ],
  )

  return (
    <AssetUploadSessionContext.Provider value={contextValue}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAllAllowedMimeTypes().join(',')}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
      />
      <AssetsGlobalDropOverlay open={isDragActive} />
      <AssetsUploadSurface />
    </AssetUploadSessionContext.Provider>
  )
}
