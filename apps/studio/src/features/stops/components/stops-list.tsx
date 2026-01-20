import { useTranslations } from '@valguide/core/i18n/client'
import { ListError } from '@/components/list-error'
import { ListPageHeader } from '@/components/list-page-header'
import type { StopWithGuides } from '../api/fetchers'
import { StopsListContent } from './stops-list-content'
import { StopsListEmpty } from './stops-list-empty'
import { StopsListLoading } from './stops-list-loading'

interface StopsListProps {
  stops?: StopWithGuides[]
  isLoading?: boolean
  error?: Error | null
  onEditStop?: (stop: StopWithGuides) => void
  onRetry?: () => void
}

export function StopsList({ stops = [], isLoading = false, error = null, onEditStop, onRetry }: StopsListProps) {
  const t = useTranslations('stops')

  const renderContent = () => {
    if (isLoading) {
      return <StopsListLoading />
    }

    if (error) {
      return <ListError error={error} onRetry={onRetry} title={t('list.error')} />
    }

    if (stops.length === 0) {
      return <StopsListEmpty />
    }

    return <StopsListContent stops={stops} onEditStop={onEditStop} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <ListPageHeader title={t('title')} description={t('list.description')} />
      {renderContent()}
    </div>
  )
}
