import type { StopWithGuides } from '../api/fetchers'
import { StopsListContent } from './stops-list-content'
import { StopsListEmpty } from './stops-list-empty'
import { StopsListError } from './stops-list-error'
import { StopsListLoading } from './stops-list-loading'

interface StopsListProps {
  stops?: StopWithGuides[]
  isLoading?: boolean
  error?: Error | null
  onEditStop?: (stop: StopWithGuides) => void
  onRetry?: () => void
}

export function StopsList({ stops = [], isLoading = false, error = null, onEditStop, onRetry }: StopsListProps) {
  if (isLoading) {
    return <StopsListLoading />
  }

  if (error) {
    return <StopsListError error={error} onRetry={onRetry} />
  }

  if (stops.length === 0) {
    return <StopsListEmpty />
  }

  return <StopsListContent stops={stops} onEditStop={onEditStop} />
}
