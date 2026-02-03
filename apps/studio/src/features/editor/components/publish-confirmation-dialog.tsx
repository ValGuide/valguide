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

interface PublishConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPublishing?: boolean
  onConfirm: () => void
}

export function PublishConfirmationDialog({
  open,
  onOpenChange,
  isPublishing,
  onConfirm,
}: PublishConfirmationDialogProps) {
  const t = useTranslations('tours.confirmPublish')
  const tActions = useTranslations('tours.actions')

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
          <AlertDialogCancel disabled={isPublishing}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPublishing}>
            {isPublishing ? tActions('publishing') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
