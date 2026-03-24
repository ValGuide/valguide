import { ASSET_IN_USE_ERROR_CODE } from '@valguide/core/features/assets/delete-asset-errors'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl, getAssetUrl } from '@valguide/core/features/assets/image-url'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { Checkbox } from '@valguide/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { RevealImage } from '@valguide/ui/components/reveal-image'
import { formatDistanceToNow } from 'date-fns'
import { Download, Image as ImageIcon, Info, MoreVertical, Music, Trash2, Video } from 'lucide-react'
import type { ComponentType, MouseEvent, TouchEvent } from 'react'
import { useRef, useState } from 'react'
import { AssetVideoThumbnail } from './asset-video-thumbnail'

export type DeleteAssetDialogComponentProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  fileName: string
  isDeleting: boolean
  onConfirmDelete: () => void
}

export type DeleteAssetDialogComponent = ComponentType<DeleteAssetDialogComponentProps>

export type AssetCardProps = {
  asset: AssetWithUsage
  onDelete?: (assetId: string) => void
  onPreview?: (asset: AssetWithUsage) => void
  shouldSuppressPreview?: () => boolean
  isSelected?: boolean
  onToggleSelected?: (assetId: string, selected: boolean) => void
  onDeleteAction?: (assetId: string) => Promise<void>
  DeleteDialog?: DeleteAssetDialogComponent
}

export function AssetCard({
  asset,
  onDelete,
  onPreview,
  shouldSuppressPreview,
  isSelected = false,
  onToggleSelected,
  onDeleteAction,
  DeleteDialog,
}: AssetCardProps) {
  const t = useTranslations('assets')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const suppressPreviewRef = useRef(false)
  const touchStartPointRef = useRef<{ x: number; y: number } | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDeleteAction?.(asset.id)
      toast.success(t('card.deleteSuccess'))
      onDelete?.(asset.id)
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast.error(
        error instanceof Error && error.message === ASSET_IN_USE_ERROR_CODE
          ? t('card.deleteBlocked')
          : t('card.deleteError'),
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDownload = () => {
    if (asset.storagePath) {
      window.open(getAssetUrl(asset.storagePath), '_blank')
    }
  }

  const totalUsage = asset.tourCount + asset.stopCount
  const usageSummary =
    totalUsage === 0
      ? t('usage.unused')
      : asset.tourCount > 0 && asset.stopCount > 0
        ? t('usage.toursAndStops', {
            tours: t('usage.toursCount', { count: asset.tourCount }),
            stops: t('usage.stopsCount', { count: asset.stopCount }),
          })
        : asset.tourCount > 0
          ? t('usage.toursCount', { count: asset.tourCount })
          : t('usage.stopsCount', { count: asset.stopCount })

  const getIcon = () => {
    switch (asset.type) {
      case 'image':
        return <ImageIcon className="h-12 w-12 text-muted-foreground" />
      case 'audio':
        return <Music className="h-12 w-12 text-muted-foreground" />
      case 'video':
        return <Video className="h-12 w-12 text-muted-foreground" />
      default:
        return null
    }
  }

  const handlePreview = (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressPreviewRef.current || shouldSuppressPreview?.()) {
      suppressPreviewRef.current = false
      event.preventDefault()
      return
    }

    onPreview?.(asset)
  }

  const handleTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0]

    if (!touch) {
      return
    }

    touchStartPointRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    suppressPreviewRef.current = shouldSuppressPreview?.() ?? false
  }

  const handleTouchMove = (event: TouchEvent<HTMLButtonElement>) => {
    const startPoint = touchStartPointRef.current
    const touch = event.touches[0]

    if (!startPoint || !touch) {
      return
    }

    const deltaX = Math.abs(touch.clientX - startPoint.x)
    const deltaY = Math.abs(touch.clientY - startPoint.y)

    if (deltaX > 8 || deltaY > 8) {
      suppressPreviewRef.current = true
    }
  }

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Checkbox
              aria-label={t('list.selectAsset')}
              checked={isSelected}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(checked) => onToggleSelected?.(asset.id, checked === true)}
            />
          </div>
          <button
            type="button"
            className="relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-muted touch-pan-y"
            onClick={handlePreview}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            aria-label={t('details.open')}
          >
            {asset.type === 'image' ? (
              <RevealImage
                src={getAssetImageUrl(asset)}
                alt={asset.fileName}
                layout="fullWidth"
                width={400}
                height={192}
              />
            ) : asset.type === 'video' ? (
              <AssetVideoThumbnail storagePath={asset.storagePath} alt={asset.fileName} width={400} height={192} />
            ) : (
              getIcon()
            )}
          </button>

          <div className="mt-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-medium" title={asset.fileName}>
                {asset.fileName}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview?.(asset)}>
                    <Info className="mr-2 h-4 w-4" />
                    {t('card.details')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('card.download')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('card.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t(`types.${asset.type}`)}</Badge>
              <Badge variant={totalUsage > 0 ? 'outline' : 'secondary'} className="text-muted-foreground">
                {usageSummary}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                {t('card.uploaded')} {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {DeleteDialog && (
        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          assetId={asset.id}
          fileName={asset.fileName}
          isDeleting={isDeleting}
          onConfirmDelete={handleDelete}
        />
      )}
    </>
  )
}
