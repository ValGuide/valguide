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
  const tGuide = useTranslations('guides.confirmUnpublishGuide')
  const tStop = useTranslations('guides.confirmUnpublishStop')
  const t = contentType === 'guide' ? tGuide : tStop

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
