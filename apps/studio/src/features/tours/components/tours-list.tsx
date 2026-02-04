import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Plus } from 'lucide-react'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import { ToursListContent } from './tours-list-content'
import { ToursListEmpty } from './tours-list-empty'
import { ToursListLoading } from './tours-list-loading'

interface ToursListProps {
  tours?: TourListItem[]
  isLoading?: boolean
  error?: Error | null
  onViewTour?: (tour: TourListItem) => void
  onCreateTour?: () => void
  onRetry?: () => void
}

export function ToursList({
  tours = [],
  isLoading = false,
  error = null,
  onViewTour,
  onCreateTour,
  onRetry,
}: ToursListProps) {
  const t = useTranslations('tours')

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
      return <ToursListEmpty onCreateTour={onCreateTour} />
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
            <Button onClick={onCreateTour} className="group">
              <Plus className="transition-transform duration-200 group-hover:rotate-90" />
              {t('empty.createNewButton')}
            </Button>
          )
        }
      />
      {renderContent()}
    </div>
  )
}
