import { ASSET_IN_USE_ERROR_CODE } from '@valguide/core/features/assets/delete-asset-errors'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl, getAssetUrl } from '@valguide/core/features/assets/image-url'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Checkbox } from '@valguide/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { RevealImage } from '@valguide/ui/components/reveal-image'
import { cn } from '@valguide/ui/lib/utils'
import { format } from 'date-fns'
import { Heart, MoreHorizontal, Music, Trash2, Video } from 'lucide-react'
import * as React from 'react'
import type { DeleteAssetDialogComponent } from './asset-card'
import { AssetVideoThumbnail } from './asset-video-thumbnail'

type AssetListRowVariant = 'desktop' | 'mobile'

export type AssetListRowProps = {
  asset: AssetWithUsage
  variant: AssetListRowVariant
  isLast?: boolean
  onDelete?: (assetId: string) => void
  onOpenDetails?: (asset: AssetWithUsage) => void
  shouldSuppressOpenDetails?: () => boolean
  isSelected?: boolean
  onToggleSelected?: (assetId: string, selected: boolean) => void
  onDeleteAction?: (assetId: string) => Promise<void>
  DeleteDialog?: DeleteAssetDialogComponent
}

export function AssetListRow({
  asset,
  variant,
  isLast = false,
  onDelete,
  onOpenDetails,
  shouldSuppressOpenDetails,
  isSelected = false,
  onToggleSelected,
  onDeleteAction,
  DeleteDialog,
}: AssetListRowProps) {
  const t = useTranslations('assets')
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const suppressOpenDetailsRef = React.useRef(false)
  const touchStartPointRef = React.useRef<{ x: number; y: number } | null>(null)

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

  const createdAt = format(new Date(asset.createdAt), 'MMM do, yyyy')
  const totalUsage = asset.tourCount + asset.stopCount
  const usageSummary =
    totalUsage === 0
      ? t('usage.unused')
      : t('usage.summaryTotal', {
          count: totalUsage,
        })
  const usageBreakdown =
    totalUsage > 0
      ? asset.tourCount > 0 && asset.stopCount > 0
        ? t('usage.toursAndStops', {
            tours: t('usage.toursCount', { count: asset.tourCount }),
            stops: t('usage.stopsCount', { count: asset.stopCount }),
          })
        : asset.tourCount > 0
          ? t('usage.toursCount', { count: asset.tourCount })
          : t('usage.stopsCount', { count: asset.stopCount })
      : null

  const thumbnail =
    asset.type === 'image' ? (
      <RevealImage src={getAssetImageUrl(asset)} alt={asset.fileName} layout="constrained" width={64} height={48} />
    ) : asset.type === 'video' ? (
      <AssetVideoThumbnail storagePath={asset.storagePath} alt={asset.fileName} width={64} height={48} />
    ) : asset.type === 'audio' ? (
      <Music className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Video className="h-4 w-4 text-muted-foreground" />
    )

  const handleOpenDetails = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressOpenDetailsRef.current || shouldSuppressOpenDetails?.()) {
      suppressOpenDetailsRef.current = false
      event.preventDefault()
      return
    }

    onOpenDetails?.(asset)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0]

    if (!touch) {
      return
    }

    touchStartPointRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    suppressOpenDetailsRef.current = shouldSuppressOpenDetails?.() ?? false
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    const startPoint = touchStartPointRef.current
    const touch = event.touches[0]

    if (!startPoint || !touch) {
      return
    }

    const deltaX = Math.abs(touch.clientX - startPoint.x)
    const deltaY = Math.abs(touch.clientY - startPoint.y)

    if (deltaX > 8 || deltaY > 8) {
      suppressOpenDetailsRef.current = true
    }
  }

  if (variant === 'mobile') {
    return (
      <>
        <div
          className={cn(
            'grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-2 py-3',
            !isLast && 'shadow-[inset_0_-1px_0_0_hsl(var(--border))]',
          )}
        >
          <Checkbox
            aria-label={t('list.selectAsset')}
            checked={isSelected}
            onClick={(event) => event.stopPropagation()}
            onCheckedChange={(checked) => onToggleSelected?.(asset.id, checked === true)}
          />
          <button
            type="button"
            className="col-span-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-left touch-pan-y"
            onClick={handleOpenDetails}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            aria-label={t('details.open')}
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-muted">
              {thumbnail}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-medium">{asset.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {usageSummary} · {createdAt}
              </p>
            </div>
          </button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Heart className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>{t('card.download')}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                {t('card.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {DeleteDialog ? (
          <DeleteDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            assetId={asset.id}
            fileName={asset.fileName}
            isDeleting={isDeleting}
            onConfirmDelete={handleDelete}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[36px_minmax(0,2fr)_110px_150px_140px_44px_44px] items-center gap-3 px-3 py-2.5',
          !isLast && 'shadow-[inset_0_-1px_0_0_hsl(var(--border))]',
        )}
      >
        <Checkbox
          aria-label={t('list.selectAsset')}
          checked={isSelected}
          onClick={(event) => event.stopPropagation()}
          onCheckedChange={(checked) => onToggleSelected?.(asset.id, checked === true)}
        />
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 text-left"
          onClick={() => onOpenDetails?.(asset)}
          aria-label={t('details.open')}
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-muted">
            {thumbnail}
          </div>
          <p className="truncate text-sm font-medium">{asset.fileName}</p>
        </button>
        <span className="text-sm text-muted-foreground">{t('list.upload')}</span>
        <div className="min-w-0 space-y-1">
          <Badge variant={totalUsage > 0 ? 'outline' : 'secondary'} className="max-w-full">
            {usageSummary}
          </Badge>
          {usageBreakdown ? <p className="truncate text-xs text-muted-foreground">{usageBreakdown}</p> : null}
        </div>
        <span className="text-sm text-muted-foreground">{createdAt}</span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Heart className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>{t('card.download')}</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('card.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {DeleteDialog ? (
        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          assetId={asset.id}
          fileName={asset.fileName}
          isDeleting={isDeleting}
          onConfirmDelete={handleDelete}
        />
      ) : null}
    </>
  )
}
