'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter } from '@valguide/ui/components/card'
import { Button } from '@valguide/ui/components/button'
import { Badge } from '@valguide/ui/components/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@valguide/ui/components/alert-dialog'
import { Image, Music, Video, MoreVertical, Trash2, Download, Eye } from 'lucide-react'
import type { Asset } from '@valguide/core/features/assets/schema'
import { deleteAsset } from '@valguide/core/features/assets/actions'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export type AssetCardProps = {
  asset: Asset
  onDelete?: (assetId: string) => void
  onPreview?: (asset: Asset) => void
}

export function AssetCard({ asset, onDelete, onPreview }: AssetCardProps) {
  const t = useTranslations('assets')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteAsset(asset.id)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-4">
          {/* Preview Area */}
          <div
            className="relative mb-3 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-muted cursor-pointer"
            onClick={() => onPreview?.(asset)}
          >
            {asset.type === 'image' && asset.publicUrl ? (
              <img src={asset.publicUrl} alt={asset.fileName} className="h-full w-full object-cover" />
            ) : (
              getIcon()
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="secondary" size="sm" onClick={() => onPreview?.(asset)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('card.preview')}
              </Button>
            </div>
          </div>

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
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                {t('card.size')}: {formatFileSize(asset.fileSize)}
              </div>
              <div>
                {t('card.uploaded')} {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('card.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('card.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? t('card.deleting') : t('card.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
