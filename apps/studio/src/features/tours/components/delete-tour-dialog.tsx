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
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { useIsMobile } from '@valguide/ui/hooks/use-mobile'
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
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="full-height">
        <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t('deleteConfirmTitle')}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {t('deleteConfirmDescriptionWithName', { name: tourName ?? '' })}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation-mobile">
                {t('deleteConfirmInstruction', { phrase: confirmationPhrase })}
              </Label>
              <Input
                id="delete-confirmation-mobile"
                value={confirmationInput}
                onChange={(e) => onConfirmationInputChange(e.target.value)}
                placeholder={confirmationPhrase}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('archive.cancelButton')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading || !isConfirmationValid}>
              {isLoading ? tCommon('loading') : t('permanentlyDelete')}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    )
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
