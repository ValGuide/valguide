import { Link } from '@tanstack/react-router'
import type {
  AssetDeletionEligibility,
  BulkAssetDeletionPreview,
} from '@valguide/core/features/assets/get-bulk-asset-deletion-preview.fn'
import { useTranslations } from '@valguide/core/i18n/client'
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
import { Badge } from '@valguide/ui/components/badge'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type SelectedAsset = {
  id: string
  fileName: string
}

export type BulkDeleteAssetsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAssets: SelectedAsset[]
  isDeleting: boolean
  onGetPreview?: (assetIds: string[]) => Promise<BulkAssetDeletionPreview>
  onConfirmDelete: (assetIds: string[]) => Promise<void> | void
}

function UsageLinks({ asset }: { asset: AssetDeletionEligibility }) {
  const t = useTranslations('assets')
  const linkedTours = asset.tours.slice(0, 2)
  const linkedStops = asset.stops.slice(0, 2)
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

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{usageSummary}</p>
      {linkedTours.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {linkedTours.map((tour) => (
            <Link
              key={tour.id}
              to="/tours/$nanoId/edit"
              params={{ nanoId: tour.nanoId }}
              preload="intent"
              className="text-xs text-primary hover:underline"
            >
              {tour.name}
            </Link>
          ))}
        </div>
      ) : null}
      {linkedStops.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {linkedStops.map((stop) => (
            <Link
              key={stop.id}
              to="/stops/$nanoId/edit"
              params={{ nanoId: stop.nanoId }}
              preload="intent"
              className="text-xs text-primary hover:underline"
            >
              {stop.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function BulkDeleteAssetsDialog({
  open,
  onOpenChange,
  selectedAssets,
  isDeleting,
  onGetPreview,
  onConfirmDelete,
}: BulkDeleteAssetsDialogProps) {
  const t = useTranslations('assets')
  const [preview, setPreview] = useState<BulkAssetDeletionPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  useEffect(() => {
    if (!open || selectedAssets.length === 0 || !onGetPreview) {
      return
    }

    setIsLoadingPreview(true)
    onGetPreview(selectedAssets.map((asset) => asset.id))
      .then((nextPreview) => {
        setPreview(nextPreview)
      })
      .catch(console.error)
      .finally(() => {
        setIsLoadingPreview(false)
      })
  }, [open, onGetPreview, selectedAssets])

  useEffect(() => {
    if (!open) {
      setPreview(null)
    }
  }, [open])

  const selectedCount = selectedAssets.length
  const previewAssets = preview?.assets ?? []
  const deletableAssets = useMemo(() => previewAssets.filter((asset) => asset.deletable), [previewAssets])
  const blockedAssets = useMemo(() => previewAssets.filter((asset) => !asset.deletable), [previewAssets])
  const missingCount = preview?.missingAssetIds.length ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('bulkDelete.title', { count: selectedCount })}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('bulkDelete.loadingPreview')}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">{t('bulkDelete.summary.selected')}</div>
                      <div className="text-lg font-medium">{selectedCount}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">{t('bulkDelete.summary.deletable')}</div>
                      <div className="text-lg font-medium">{deletableAssets.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">{t('bulkDelete.summary.blocked')}</div>
                      <div className="text-lg font-medium">{blockedAssets.length + missingCount}</div>
                    </div>
                  </div>

                  {deletableAssets.length > 0 ? (
                    <p>{t('bulkDelete.descriptionDeletable', { count: deletableAssets.length })}</p>
                  ) : (
                    <p>{t('bulkDelete.descriptionBlockedOnly')}</p>
                  )}

                  {blockedAssets.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">{t('bulkDelete.blockedTitle')}</p>
                      <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                        {blockedAssets.map((asset) => (
                          <div key={asset.assetId} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{asset.fileName}</p>
                              </div>
                              <Badge variant="outline">{t('bulkDelete.blockedBadge')}</Badge>
                            </div>
                            <UsageLinks asset={asset} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {missingCount > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t('bulkDelete.missingAssets', { count: missingCount })}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('bulkDelete.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirmDelete(deletableAssets.map((asset) => asset.assetId))}
            disabled={isDeleting || isLoadingPreview || deletableAssets.length === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting
              ? t('bulkDelete.actions.deleting')
              : t('bulkDelete.actions.deleteEligible', { count: deletableAssets.length })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
