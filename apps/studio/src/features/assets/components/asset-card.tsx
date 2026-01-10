import { Image as UnpicImage } from '@unpic/react'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { AssetWithUsage } from '@valguide/core/features/assets/queries'
import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { Download, Eye, Image, MoreVertical, Music, Trash2, Video } from 'lucide-react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

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
  onDeleteAction?: (assetId: string) => Promise<void>
  DeleteDialog?: DeleteAssetDialogComponent
}

export function AssetCard({ asset, onDelete, onPreview, onDeleteAction, DeleteDialog }: AssetCardProps) {
  const t = useTranslations('assets')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDeleteAction?.(asset.id)
      toast.success(t('card.deleteSuccess'))
      onDelete?.(asset.id)
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast.error(t('card.deleteError'))
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDownload = () => {
    if (asset.publicUrl) {
      window.open(asset.publicUrl, '_blank')
    }
  }

  const getIcon = () => {
    switch (asset.type) {
      case 'image':
        return <Image className="h-12 w-12 text-muted-foreground" />
      case 'audio':
        return <Music className="h-12 w-12 text-muted-foreground" />
      case 'video':
        return <Video className="h-12 w-12 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-4">
          {/* Preview Area */}
          <button
            type="button"
            className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-muted cursor-pointer"
            onClick={() => onPreview?.(asset)}
          >
            {asset.type === 'image' ? (
              <UnpicImage
                src={getAssetImageUrl(asset)}
                alt={asset.fileName}
                layout="fullWidth"
                className="h-full w-full object-cover"
              />
            ) : (
              getIcon()
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="inline-flex items-center text-sm font-medium text-secondary bg-secondary-foreground/90 px-3 py-1.5 rounded-md">
                <Eye className="mr-2 h-4 w-4" />
                {t('card.preview')}
              </span>
            </div>
          </button>

          {/* File Info */}
          <div className="space-y-2">
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
                    <Eye className="mr-2 h-4 w-4" />
                    {t('card.preview')}
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
              {asset.locale && (
                <Badge variant="outline" className="uppercase">
                  {asset.locale}
                </Badge>
              )}
              {(asset.guideCount > 0 || asset.stopCount > 0) && (
                <Badge variant="outline" className="text-muted-foreground">
                  {asset.guideCount > 0 && asset.stopCount > 0
                    ? t('usage.guidesAndStops', {
                        guides: t('usage.guidesCount', { count: asset.guideCount }),
                        stops: t('usage.stopsCount', { count: asset.stopCount }),
                      })
                    : asset.guideCount > 0
                      ? t('usage.guidesCount', { count: asset.guideCount })
                      : t('usage.stopsCount', { count: asset.stopCount })}
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div>{t('card.sizeValue', { size: formatFileSize(asset.fileSize) })}</div>
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
