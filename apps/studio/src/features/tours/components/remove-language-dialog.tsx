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
import { useState } from 'react'
import { getLocaleDisplayName } from './unified-locale-selector'

export type RemoveLanguageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string | null
  onConfirm: () => Promise<void>
}

export function RemoveLanguageDialog({ open, onOpenChange, locale, onConfirm }: RemoveLanguageDialogProps) {
  const t = useTranslations('tours.localesManager')
  const [isLoading, setIsLoading] = useState(false)

  const localeName = locale ? getLocaleDisplayName(locale) : ''

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmRemoveTitle', { language: localeName })}</AlertDialogTitle>
          <AlertDialogDescription>{t('confirmRemoveDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('confirmRemove')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
