'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { Music, Plus, Video, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef } from 'react'

export type MediaPickerGalleryProps = {
  assets: Asset[]
  onRemove: (assetId: string) => void
  onAdd: (file: File) => void
  acceptedMimeTypes: string[]
  disabled?: boolean
}

export function MediaPickerGallery({
  assets,
  onRemove,
  onAdd,
  acceptedMimeTypes,
  disabled = false,
}: MediaPickerGalleryProps) {
  const t = useTranslations('assets.mediaPicker')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dedupe assets by ID to prevent React key warnings
  const uniqueAssets = useMemo(() => {
    const seen = new Set<string>()
    return assets.filter((asset) => {
      if (seen.has(asset.id)) return false
      seen.add(asset.id)
      return true
    })
  }, [assets])

  const handleAddClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onAdd(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onAdd],
  )

  const renderThumbnail = (asset: Asset) => {
    switch (asset.type) {
      case 'image':
        return asset.publicUrl ? (
          // biome-ignore lint/performance/noImgElement: Using img for dynamic content
          <img src={asset.publicUrl} alt={asset.fileName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">{t('noPreview')}</span>
          </div>
        )
      case 'audio':
        return (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        )
      case 'video':
        return (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMimeTypes.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {uniqueAssets.map((asset) => (
          <div key={asset.id} className="relative aspect-square overflow-hidden rounded-lg border bg-card">
            {renderThumbnail(asset)}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => onRemove(asset.id)}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">{t('remove')}</span>
            </Button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled}
          className={cn(
            'aspect-square flex items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            'hover:border-primary/50 hover:bg-accent/50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="sr-only">{t('addMore')}</span>
        </button>
      </div>
    </div>
  )
}
