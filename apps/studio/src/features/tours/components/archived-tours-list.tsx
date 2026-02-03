import type { ArchivedTourListItem } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { useState } from 'react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { ArchivedToursListContent } from './archived-tours-list-content'
import { ArchivedToursListEmpty } from './archived-tours-list-empty'
import { ArchivedToursListLoading } from './archived-tours-list-loading'
import { DeleteTourDialog } from './delete-tour-dialog'
import { RecoverTourDialog } from './recover-tour-dialog'

export interface ArchivedToursListProps {
  guides?: ArchivedTourListItem[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  onRecover?: (nanoId: string) => Promise<void>
  onDelete?: (nanoId: string) => Promise<void>
}

type DialogState = {
  type: 'recover' | 'delete' | null
  tourId: string | null
  guideName: string | null
}

export function ArchivedToursList({
  guides = [],
  isLoading = false,
  error = null,
  onRetry,
  onRecover,
  onDelete,
}: ArchivedToursListProps) {
  const t = useTranslations('tours')
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, tourId: null, guideName: null })
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const handleDialogClose = () => {
    setDialogState({ type: null, tourId: null, guideName: null })
    setConfirmationInput('')
  }

  const handleRecover = async () => {
    if (!dialogState.tourId || !onRecover) return
    setIsActionLoading(true)
    try {
      await onRecover(dialogState.tourId)
      // Dialog closes itself via onOpenChange after invalidation completes
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dialogState.tourId || !onDelete) return
    setIsActionLoading(true)
    try {
      await onDelete(dialogState.tourId)
      // Dialog closes itself via onOpenChange after invalidation completes
    } finally {
      setIsActionLoading(false)
    }
  }

  const openRecoverDialog = (tourId: string, guideName: string) => {
    setDialogState({ type: 'recover', tourId, guideName })
  }

  const openDeleteDialog = (tourId: string, guideName: string) => {
    setDialogState({ type: 'delete', tourId, guideName })
  }

  const renderContent = () => {
    if (isLoading) {
      return <ArchivedToursListLoading />
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

    if (tours.length === 0) {
      return <ArchivedToursListEmpty />
    }

    return <ArchivedToursListContent guides={guides} onRecover={openRecoverDialog} onDelete={openDeleteDialog} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ListPageHeader title={t('archived.title')} description={t('archived.description')} />

      {renderContent()}

      <RecoverTourDialog
        open={dialogState.type === 'recover'}
        onOpenChange={() => handleDialogClose()}
        isLoading={isActionLoading}
        onConfirm={handleRecover}
      />

      <DeleteTourDialog
        open={dialogState.type === 'delete'}
        onOpenChange={() => handleDialogClose()}
        guideName={dialogState.tourName}
        confirmationInput={confirmationInput}
        onConfirmationInputChange={setConfirmationInput}
        isLoading={isActionLoading}
        onConfirm={handleDelete}
      />
    </div>
  )
}
