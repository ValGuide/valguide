import { Link } from '@tanstack/react-router'
import type { ThemeUsageDetails } from '@valguide/core/features/themes/get-theme-usage.fn'
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

export interface DeleteThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  themeId: string
  themeName: string
  onConfirm: () => Promise<void>
  isLoading: boolean
  onGetUsage?: (themeId: string) => Promise<ThemeUsageDetails>
}

export function DeleteThemeDialog({
  open,
  onOpenChange,
  themeId,
  themeName,
  onConfirm,
  isLoading,
  onGetUsage,
}: DeleteThemeDialogProps) {
  const t = useTranslations('studio.themeCustomizer.deleteDialog')
  const [usage, setUsage] = useState<ThemeUsageDetails | null>(null)
  const [isLoadingUsage, setIsLoadingUsage] = useState(false)

  useEffect(() => {
    if (!open || !themeId || !onGetUsage) {
      return
    }

    let isActive = true

    setUsage(null)
    setIsLoadingUsage(true)

    onGetUsage(themeId)
      .then((data) => {
        if (!isActive) {
          return
        }

        setUsage(data)
      })
      .catch(console.error)
      .finally(() => {
        if (!isActive) {
          return
        }

        setIsLoadingUsage(false)
      })

    return () => {
      isActive = false
    }
  }, [open, themeId, onGetUsage])

  useEffect(() => {
    if (!open) {
      setUsage(null)
    }
  }, [open])

  const handleConfirm = async () => {
    await onConfirm()
  }

  const hasUsage = Boolean(usage && usage.tours.length > 0)
  const hasWarning = Boolean(usage && (usage.tours.length > 0 || usage.isWorkspaceDefault))
  const fallbackMessage = usage?.isWorkspaceDefault
    ? hasUsage
      ? t('fallbackDescriptionUsedAndDefault')
      : t('fallbackDescriptionDefaultOnly')
    : t('fallbackDescriptionUsedOnly')
  const scopeLabel = (scope: 'draft' | 'published' | 'draftAndPublished') => {
    return t(`scope.${scope}`)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasWarning ? <AlertTriangle className="size-5 text-destructive" /> : null}
            {hasWarning ? t('warningTitle') : t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {isLoadingUsage ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t('loadingUsage')}
                </div>
              ) : hasWarning ? (
                <>
                  {hasUsage && usage?.isWorkspaceDefault ? (
                    <p>
                      {t('usedByToursAndWorkspaceDefaultDescription', { name: themeName, count: usage.tours.length })}
                    </p>
                  ) : null}
                  {hasUsage && !usage?.isWorkspaceDefault ? (
                    <p>{t('usedByToursDescription', { name: themeName, count: usage.tours.length })}</p>
                  ) : null}
                  {!hasUsage && usage?.isWorkspaceDefault ? (
                    <p>{t('workspaceDefaultDescription', { name: themeName })}</p>
                  ) : null}
                  <p className="text-foreground">{fallbackMessage}</p>

                  {hasUsage ? (
                    <div>
                      <p className="font-medium text-foreground">{t('usedBy')}</p>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                        {usage?.tours.map((tour) => (
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
                            <span className="text-muted-foreground"> ({scopeLabel(tour.scope)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {hasUsage ? <p className="text-destructive">{t('reviewWarning')}</p> : null}
                </>
              ) : (
                <p>{t('message', { name: themeName })}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || isLoadingUsage}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
