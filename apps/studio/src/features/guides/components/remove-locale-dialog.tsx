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

interface RemoveLocaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  localeName: string
  isLoading: boolean
  onConfirm: () => Promise<void>
}

export function RemoveLocaleDialog({ open, onOpenChange, localeName, isLoading, onConfirm }: RemoveLocaleDialogProps) {
  const t = useTranslations('guides.localesManager')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmRemoveTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('confirmRemoveDescription', { language: localeName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {t('confirmRemove')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
