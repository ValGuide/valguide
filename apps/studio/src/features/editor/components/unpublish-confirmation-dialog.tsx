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
  contentType: 'guide' | 'stop'
  onConfirm: () => void
}

export function UnpublishConfirmationDialog({
  open,
  onOpenChange,
  contentType,
  onConfirm,
}: UnpublishConfirmationDialogProps) {
  // i18n-used-keys: tours.confirmUnpublishTour.title, tours.confirmUnpublishTour.description, tours.confirmUnpublishTour.cancel, tours.confirmUnpublishTour.confirm
  const tTour = useTranslations('tours.confirmUnpublishTour')
  // i18n-used-keys: tours.confirmUnpublishStop.title, tours.confirmUnpublishStop.description, tours.confirmUnpublishStop.cancel, tours.confirmUnpublishStop.confirm
  const tStop = useTranslations('tours.confirmUnpublishStop')
  const t = contentType === 'tour' ? tTour : tStop

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
