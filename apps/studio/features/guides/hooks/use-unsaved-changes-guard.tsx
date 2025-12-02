'use client'

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
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean
}

export function useUnsavedChangesGuard({ isDirty }: UseUnsavedChangesGuardOptions) {
  const t = useTranslations('guides.unsavedChanges')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [open, setOpen] = useState(false)

  const confirmIfDirty = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action()
        return
      }
      setPendingAction(() => action)
      setOpen(true)
    },
    [isDirty],
  )

  useEffect(() => {
    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const dialog = (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
              setOpen(false)
              setPendingAction(null)
              action?.()
            }}
          >
            {t('leave')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirmIfDirty, dialog }
}
