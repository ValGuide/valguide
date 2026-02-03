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

interface RemoveStopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stopTitle: string
  onConfirm: () => void
}

export function RemoveStopDialog({ open, onOpenChange, stopTitle, onConfirm }: RemoveStopDialogProps) {
  const t = useTranslations('stops')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('stopActions.removeStop')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('stopActions.removeDescription')}
            <span className="mt-2 block font-medium text-foreground">{stopTitle}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('stopActions.removeConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
