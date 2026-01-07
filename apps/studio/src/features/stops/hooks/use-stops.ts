import { useQuery } from '@tanstack/react-query'
import type { StopWithGuides } from '../api/fetchers'
import { stopsQueryOptions } from '../query-options'

interface UseStopsReturn {
  stops: StopWithGuides[]
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
