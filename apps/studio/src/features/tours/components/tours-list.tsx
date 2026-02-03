import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { ToursListContent } from './tours-list-content'
import { ToursListEmpty } from './tours-list-empty'
import { ToursListLoading } from './tours-list-loading'

interface ToursListProps {
  tours?: TourListItem[]
  isLoading?: boolean
  error?: Error | null
  onCreateTour?: (data: { title?: string; locale?: string }) => Promise<{ nanoId: string }>
  onViewTour?: (tour: TourListItem) => void
  onNavigateToTour?: (nanoId: string) => void
  onRetry?: () => void
}

export function ToursList({
  tours = [],
  isLoading = false,
  error = null,
  onCreateTour,
  onViewTour,
  onNavigateToTour,
  onRetry,
}: ToursListProps) {
  const t = useTranslations('tours')
  const locale = useLocale()
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateTour = React.useCallback(async () => {
    if (!onCreateTour) {
      console.error('onCreateTour handler not provided')
      return
    }

    try {
      setIsCreating(true)

      // Create a new tour with empty title in the current studio language
      const newTour = await onCreateTour({
        locale,
      })

      // Navigate to tour editor if handler provided
      if (onNavigateToTour && newTour?.nanoId) {
        onNavigateToTour(newTour.nanoId)
      }
    } catch (err) {
      console.error('Failed to create tour:', err)
      toast.error(t('create.error'), {
        description: err instanceof Error ? err.message : t('create.errorDescription'),
      })
    } finally {
      setIsCreating(false)
    }
  }, [onCreateTour, onNavigateToTour, locale, t])

  const renderContent = () => {
    if (isLoading) {
      return <ToursListLoading />
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
      return <ToursListEmpty isCreating={isCreating} onCreateTour={handleCreateTour} />
    }

    return <ToursListContent tours={tours} onViewTour={onViewTour} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ListPageHeader
        title={t('title')}
        description={t('description')}
        action={
          tours.length > 0 && (
            <Button onClick={handleCreateTour} disabled={isCreating} className="group">
              <Plus className="transition-transform duration-200 group-hover:rotate-90" />
              {isCreating ? t('empty.creating') : t('empty.createNewButton')}
            </Button>
          )
        }
      />
      {renderContent()}
    </div>
  )
}
