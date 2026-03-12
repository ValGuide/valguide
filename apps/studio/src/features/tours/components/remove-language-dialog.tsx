import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { getLocalePresentation } from '@valguide/core/i18n/locale-display-names'
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

export type RemoveLanguageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string | null
  onConfirm: () => Promise<void>
}

export function RemoveLanguageDialog({ open, onOpenChange, locale, onConfirm }: RemoveLanguageDialogProps) {
  const displayLocale = useLocale()
  const t = useTranslations('tours.localesManager')
  const [isLoading, setIsLoading] = useState(false)

  const localeName = locale ? getLocalePresentation(locale, displayLocale).localizedName : ''

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
