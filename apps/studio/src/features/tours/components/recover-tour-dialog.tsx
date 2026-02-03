import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
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

interface RecoverTourDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => Promise<void>
}

export function RecoverTourDialog({ open, onOpenChange, isLoading, onConfirm }: RecoverTourDialogProps) {
  const t = useTranslations('tours')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()

  const handleRecover = async () => {
    try {
      await onConfirm()
      toast.success(t('recover.success'), {
        description: t('recover.successDescription'),
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tours'] }),
        queryClient.invalidateQueries({ queryKey: ['archived-tours'] }),
      ])
      onOpenChange(false)
    } catch (_error) {
      toast.error(t('recover.error'), {
        description: t('recover.errorDescription'),
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('recoverConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('recoverConfirmDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleRecover} disabled={isLoading}>
            {isLoading ? tCommon('loading') : t('recoverTour')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
