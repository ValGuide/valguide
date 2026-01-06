import { Image } from '@unpic/react'
import type { Asset } from '@valguide/core/features/assets/schema'
import { useTranslations } from '@valguide/core/i18n/mock'
import { Button } from '@valguide/ui/components/button'
import { Music, Trash2, Video } from 'lucide-react'

export type MediaPickerPreviewProps = {
  asset: Asset
  onRemove: () => void
  disabled?: boolean
}

export function MediaPickerPreview({ asset, onRemove, disabled = false }: MediaPickerPreviewProps) {
  const t = useTranslations('assets.mediaPicker')

  const renderPreview = () => {
    switch (asset.type) {
      case 'image':
        return asset.publicUrl ? (
          <Image src={asset.publicUrl} alt={asset.fileName} layout="fullWidth" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">{t('noPreview')}</span>
          </div>
        )
      case 'audio':
        return (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
        )
      case 'video':
        return (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )
    }
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="relative aspect-video w-full">{renderPreview()}</div>
      <div className="flex items-center justify-between border-t bg-card p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={asset.fileName}>
            {asset.fileName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="ml-4 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">{t('remove')}</span>
        </Button>
      </div>
    </div>
  )
}
