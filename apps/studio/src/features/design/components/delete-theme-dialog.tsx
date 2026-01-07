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
import { Loader2 } from 'lucide-react'

export interface DeleteThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  themeName: string
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export function DeleteThemeDialog({ open, onOpenChange, themeName, onConfirm, isLoading }: DeleteThemeDialogProps) {
  const t = useTranslations('studio.themeCustomizer.deleteDialog')

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('message', { name: themeName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
