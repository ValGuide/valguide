import { Link } from '@tanstack/react-router'
import type { AssetUsageDetails } from '@valguide/core/features/assets/get-asset-usage.fn'
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
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export type DeleteAssetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  fileName: string
  isDeleting: boolean
  onConfirmDelete: () => void
  onGetUsage?: (assetId: string) => Promise<AssetUsageDetails>
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  assetId,
  fileName,
  isDeleting,
  onConfirmDelete,
  onGetUsage,
}: DeleteAssetDialogProps) {
  const t = useTranslations('assets')
  const [usage, setUsage] = useState<AssetUsageDetails | null>(null)
  const [isLoadingUsage, setIsLoadingUsage] = useState(false)

  useEffect(() => {
    if (open && !usage && onGetUsage) {
      setIsLoadingUsage(true)
      onGetUsage(assetId)
        .then((data) => {
          setUsage(data)
        })
        .catch(console.error)
        .finally(() => {
          setIsLoadingUsage(false)
        })
    }
  }, [open, assetId, usage, onGetUsage])

  useEffect(() => {
    if (!open) {
      setUsage(null)
    }
  }, [open])

  const hasUsage = usage && (usage.tours.length > 0 || usage.stops.length > 0)

  const scopeLabel = (scope: 'draft' | 'published' | 'draftAndPublished') => {
    return t(`deleteWithUsage.scope.${scope}`)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasUsage && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {hasUsage ? t('deleteWithUsage.warningTitle') : t('deleteWithUsage.title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {isLoadingUsage ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('deleteWithUsage.loadingUsage')}
                </div>
              ) : hasUsage ? (
                <>
                  <p>{t('deleteWithUsage.blockedDescription', { fileName })}</p>

                  {usage.tours.length > 0 && (
                    <div>
                      <p className="font-medium text-foreground">{t('deleteWithUsage.toursSection')}</p>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                        {usage.tours.map((tour) => (
                          <li key={tour.id}>
                            <Link
                              to="/tours/$nanoId/edit"
                              params={{ nanoId: tour.nanoId }}
                              preload="intent"
                              className="text-primary hover:underline"
                              onClick={() => onOpenChange(false)}
                            >
                              {tour.name}
                            </Link>
                            <span className="text-muted-foreground">
                              ({scopeLabel(tour.scope)}, {tour.channel})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {usage.stops.length > 0 && (
                    <div>
                      <p className="font-medium text-foreground">{t('deleteWithUsage.stopsSection')}</p>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                        {usage.stops.map((stop) => (
                          <li key={stop.id}>
                            <Link
                              to="/stops/$nanoId/edit"
                              params={{ nanoId: stop.nanoId }}
                              preload="intent"
                              className="text-primary hover:underline"
                              onClick={() => onOpenChange(false)}
                            >
                              {stop.name}
                            </Link>
                            <span className="text-muted-foreground">
                              ({scopeLabel(stop.scope)}, {stop.channel})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-destructive">{t('deleteWithUsage.blockedWarning')}</p>
                </>
              ) : (
                <p>{t('card.deleteConfirm')}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {hasUsage ? t('deleteWithUsage.close') : t('card.cancel')}
          </AlertDialogCancel>
          {!hasUsage ? (
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeleting || isLoadingUsage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('card.deleting') : t('card.delete')}
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
