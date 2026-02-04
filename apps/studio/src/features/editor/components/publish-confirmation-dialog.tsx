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
  languageName: string
}

export function PublishConfirmationDialog({
  open,
  onOpenChange,
  isPublishing,
  onConfirm,
  languageName,
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
          <AlertDialogTitle>{t('title', { language: languageName })}</AlertDialogTitle>
          <AlertDialogDescription>{t('description', { language: languageName })}</AlertDialogDescription>
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
