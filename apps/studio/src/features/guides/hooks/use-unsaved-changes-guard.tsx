import { useBlocker } from '@tanstack/react-router'
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
import { useCallback, useState } from 'react'

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean
}

export function useUnsavedChangesGuard({ isDirty }: UseUnsavedChangesGuardOptions) {
  const t = useTranslations('guides.unsavedChanges')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)

  // Use TanStack Router's useBlocker for router-level navigation blocking
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  })

  // For programmatic navigation (e.g., back buttons that use confirmIfDirty)
  const confirmIfDirty = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action()
        return
      }
      setPendingAction(() => action)
      setManualDialogOpen(true)
    },
    [isDirty],
  )

  const isBlocked = status === 'blocked'

  const dialog = (
    <>
      {/* Router-level navigation blocking dialog */}
      <AlertDialog open={isBlocked} onOpenChange={(open) => !open && reset?.()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => reset?.()}>{t('stay')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceed?.()}>{t('leave')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual confirmation dialog (for programmatic navigation via confirmIfDirty) */}
      <AlertDialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('stay')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = pendingAction
                setManualDialogOpen(false)
                setPendingAction(null)
                action?.()
              }}
            >
              {t('leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  return { confirmIfDirty, dialog }
}
