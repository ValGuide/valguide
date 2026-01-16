import { useQueryClient } from '@tanstack/react-query'
import { deleteGuideFn, recoverGuideFn } from '@valguide/core/features/guides/server-functions'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
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
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArchivedGuidesListContent } from './archived-guides-list-content'
import { ArchivedGuidesListEmpty } from './archived-guides-list-empty'

interface ArchivedGuidesListProps {
  guides: GuideWithTranslationsAndCover[]
  userId: string
  onActionComplete?: () => void
}

type DialogState = {
  type: 'recover' | 'delete' | null
  guideId: string | null
  guideName: string | null
}

export function ArchivedGuidesList({ guides, userId: _userId, onActionComplete }: ArchivedGuidesListProps) {
  const t = useTranslations('guides')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, guideId: null, guideName: null })
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const confirmationPhrase = t('deleteConfirmPhrase')
  const isConfirmationValid = useMemo(() => {
    return confirmationInput.trim().toLowerCase() === confirmationPhrase.trim().toLowerCase()
  }, [confirmationInput, confirmationPhrase])

  const handleDialogClose = () => {
    setDialogState({ type: null, guideId: null, guideName: null })
    setConfirmationInput('')
  }

  const handleRecover = async () => {
    if (!dialogState.guideId) return

    setIsLoading(true)
    try {
      await recoverGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('recover.success'), {
        description: t('recover.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['guides'] })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('recover.error'), {
        description: t('recover.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      handleDialogClose()
    }
  }

  const handleDelete = async () => {
    if (!dialogState.guideId || !isConfirmationValid) return

    setIsLoading(true)
    try {
      await deleteGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('delete.success'), {
        description: t('delete.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
      onActionComplete?.()
    } catch (_error) {
      toast.error(t('delete.error'), {
        description: t('delete.errorDescription'),
      })
    } finally {
      setIsLoading(false)
      handleDialogClose()
    }
  }

  const openRecoverDialog = (guideId: string, guideName: string) => {
    setDialogState({ type: 'recover', guideId, guideName })
  }

  const openDeleteDialog = (guideId: string, guideName: string) => {
    setDialogState({ type: 'delete', guideId, guideName })
  }

  if (guides.length === 0) {
    return <ArchivedGuidesListEmpty />
  }

  return (
    <>
      <ArchivedGuidesListContent guides={guides} onRecover={openRecoverDialog} onDelete={openDeleteDialog} />

      <AlertDialog open={dialogState.type === 'recover'} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recoverConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('recoverConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecover} disabled={isLoading}>
              {isLoading ? tCommon('loading') : t('recoverGuide')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescriptionWithName', { name: dialogState.guideName ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">{t('deleteConfirmInstruction', { phrase: confirmationPhrase })}</Label>
            <Input
              id="delete-confirmation"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={confirmationPhrase}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading || !isConfirmationValid}
              variant="destructive"
            >
              {isLoading ? tCommon('loading') : t('permanentlyDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
