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

interface UnpublishConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isUnpublishing?: boolean
  onConfirm: () => void
  languageName: string
  contentType?: 'tour' | 'stop'
}

export function UnpublishConfirmationDialog({
  open,
  onOpenChange,
  isUnpublishing,
  onConfirm,
  languageName,
}: UnpublishConfirmationDialogProps) {
  const t = useTranslations('tours.confirmUnpublishTour')

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title', { language: languageName })}</AlertDialogTitle>
          <AlertDialogDescription>{t('description', { language: languageName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnpublishing}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isUnpublishing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
