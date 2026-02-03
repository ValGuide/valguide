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
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useMemo } from 'react'

interface DeleteTourDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourName: string | null
  confirmationInput: string
  onConfirmationInputChange: (value: string) => void
  isLoading: boolean
  onConfirm: () => Promise<void>
}

export function DeleteTourDialog({
  open,
  onOpenChange,
  tourName,
  confirmationInput,
  onConfirmationInputChange,
  isLoading,
  onConfirm,
}: DeleteTourDialogProps) {
  const t = useTranslations('tours')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()

  const confirmationPhrase = t('deleteConfirmPhrase')
  const isConfirmationValid = useMemo(() => {
    return confirmationInput.trim().toLowerCase() === confirmationPhrase.trim().toLowerCase()
  }, [confirmationInput, confirmationPhrase])

  const handleDelete = async () => {
    try {
      await onConfirm()
      toast.success(t('delete.success'), {
        description: t('delete.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['archived-tours'] })
      onOpenChange(false)
    } catch (_error) {
      toast.error(t('delete.error'), {
        description: t('delete.errorDescription'),
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteConfirmDescriptionWithName', { name: tourName ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">{t('deleteConfirmInstruction', { phrase: confirmationPhrase })}</Label>
          <Input
            id="delete-confirmation"
            value={confirmationInput}
            onChange={(e) => onConfirmationInputChange(e.target.value)}
            placeholder={confirmationPhrase}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading || !isConfirmationValid} variant="destructive">
            {isLoading ? tCommon('loading') : t('permanentlyDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
