'use client'

import { useRouter } from '@valguide/i18n/routing'
import type { StopWithGuides } from '../api/fetchers'
import { useStops } from '../hooks/use-stops'
import { StopsList } from './stops-list'

export function StopsListContainer() {
  const router = useRouter()
  const { stops, isLoading, error, refetch } = useStops()

  const handleEditStop = (stop: StopWithGuides) => {
    if (stop.nanoId) {
      router.push(`/stops/${stop.nanoId}/edit`)
    }
  }

  return <StopsList stops={stops} isLoading={isLoading} error={error} onEditStop={handleEditStop} onRetry={refetch} />
}
