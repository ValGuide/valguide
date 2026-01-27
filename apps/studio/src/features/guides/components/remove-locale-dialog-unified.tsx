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

interface RemoveLocaleDialogUnifiedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  localeName: string
  isLoading: boolean
  onConfirm: () => Promise<void>
}

export function RemoveLocaleDialogUnified({
  open,
  onOpenChange,
  localeName,
  isLoading,
  onConfirm,
}: RemoveLocaleDialogUnifiedProps) {
  const tManager = useTranslations('guides.localesManager')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tManager('confirmRemoveTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {tManager('confirmRemoveDescription', { language: localeName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tManager('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {tManager('confirmRemove')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
