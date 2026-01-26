import { useQuery } from '@tanstack/react-query'
import type { StopListItem } from '@valguide/core/features/guides/stop/list-stops'
import { stopsQueryOptions } from '../query-options'

interface UseStopsReturn {
  stops: StopListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStops(): UseStopsReturn {
  const { data, error, isLoading, refetch: queryRefetch } = useQuery(stopsQueryOptions())

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    stops: data ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
