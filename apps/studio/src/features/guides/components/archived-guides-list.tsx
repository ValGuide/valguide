import type { ArchivedGuideListItem } from '@valguide/core/features/guides/guide/list-archived-guides.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { useState } from 'react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { ArchivedGuidesListContent } from './archived-guides-list-content'
import { ArchivedGuidesListEmpty } from './archived-guides-list-empty'
import { ArchivedGuidesListLoading } from './archived-guides-list-loading'
import { DeleteGuideDialog } from './delete-guide-dialog'
import { RecoverGuideDialog } from './recover-guide-dialog'

export interface ArchivedGuidesListProps {
  guides?: ArchivedGuideListItem[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  onRecover?: (nanoId: string) => Promise<void>
  onDelete?: (nanoId: string) => Promise<void>
}

type DialogState = {
  type: 'recover' | 'delete' | null
  guideId: string | null
  guideName: string | null
}

export function ArchivedGuidesList({
  guides = [],
  isLoading = false,
  error = null,
  onRetry,
  onRecover,
  onDelete,
}: ArchivedGuidesListProps) {
  const t = useTranslations('guides')
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, guideId: null, guideName: null })
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const handleDialogClose = () => {
    setDialogState({ type: null, guideId: null, guideName: null })
    setConfirmationInput('')
  }

  const handleRecover = async () => {
    if (!dialogState.guideId || !onRecover) return
    setIsActionLoading(true)
    try {
      await onRecover(dialogState.guideId)
      handleDialogClose()
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dialogState.guideId || !onDelete) return
    setIsActionLoading(true)
    try {
      await onDelete(dialogState.guideId)
      handleDialogClose()
    } finally {
      setIsActionLoading(false)
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

      <RecoverGuideDialog
        open={dialogState.type === 'recover'}
        onOpenChange={() => handleDialogClose()}
        isLoading={isActionLoading}
        onConfirm={handleRecover}
      />

      <DeleteGuideDialog
        open={dialogState.type === 'delete'}
        onOpenChange={() => handleDialogClose()}
        guideName={dialogState.guideName}
        confirmationInput={confirmationInput}
        onConfirmationInputChange={setConfirmationInput}
        isLoading={isActionLoading}
        onConfirm={handleDelete}
      />
    </div>
  )
}
