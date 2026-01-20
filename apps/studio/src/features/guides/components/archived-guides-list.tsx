import { useQueryClient } from '@tanstack/react-query'
import { deleteGuideFn, recoverGuideFn } from '@valguide/core/features/guides/server-functions'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
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
import { useMemo, useState } from 'react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { ArchivedGuidesListContent } from './archived-guides-list-content'
import { ArchivedGuidesListEmpty } from './archived-guides-list-empty'
import { ArchivedGuidesListLoading } from './archived-guides-list-loading'

interface ArchivedGuidesListProps {
  guides?: GuideWithTranslationsAndCover[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

type DialogState = {
  type: 'recover' | 'delete' | null
  guideId: string | null
  guideName: string | null
}

export function ArchivedGuidesList({ guides = [], isLoading = false, error = null, onRetry }: ArchivedGuidesListProps) {
  const t = useTranslations('guides')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, guideId: null, guideName: null })
  const [isActionLoading, setIsActionLoading] = useState(false)
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

    setIsActionLoading(true)
    try {
      await recoverGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('recover.success'), {
        description: t('recover.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['guides'] })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
    } catch (_error) {
      toast.error(t('recover.error'), {
        description: t('recover.errorDescription'),
      })
    } finally {
      setIsActionLoading(false)
      handleDialogClose()
    }
  }

  const handleDelete = async () => {
    if (!dialogState.guideId || !isConfirmationValid) return

    setIsActionLoading(true)
    try {
      await deleteGuideFn({ data: { id: dialogState.guideId } })
      toast.success(t('delete.success'), {
        description: t('delete.successDescription'),
      })
      await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
    } catch (_error) {
      toast.error(t('delete.error'), {
        description: t('delete.errorDescription'),
      })
    } finally {
      setIsActionLoading(false)
      handleDialogClose()
    }
  }

  const openRecoverDialog = (guideId: string, guideName: string) => {
    setDialogState({ type: 'recover', guideId, guideName })
  }

  const openDeleteDialog = (guideId: string, guideName: string) => {
    setDialogState({ type: 'delete', guideId, guideName })
  }

  const renderContent = () => {
    if (isLoading) {
      return <ArchivedGuidesListLoading />
    }

    if (error) {
      return (
        <ListError
          error={error}
          onRetry={onRetry}
          title={t('error.failedToLoad')}
          fallbackMessage={t('error.unexpected')}
        />
      )
    }

    if (guides.length === 0) {
      return <ArchivedGuidesListEmpty />
    }

    return <ArchivedGuidesListContent guides={guides} onRecover={openRecoverDialog} onDelete={openDeleteDialog} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ListPageHeader title={t('archived.title')} description={t('archived.description')} />

      {renderContent()}

      <AlertDialog open={dialogState.type === 'recover'} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recoverConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('recoverConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecover} disabled={isActionLoading}>
              {isActionLoading ? tCommon('loading') : t('recoverGuide')}
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
              disabled={isActionLoading}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>{t('archive.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isActionLoading || !isConfirmationValid}
              variant="destructive"
            >
              {isActionLoading ? tCommon('loading') : t('permanentlyDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
