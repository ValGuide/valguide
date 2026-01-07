import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { StopWithGuides } from '../api/fetchers'
import { getStopsFn } from '../server-functions'

interface UseStopsReturn {
  stops: StopWithGuides[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

async function fetchStops(): Promise<StopWithGuides[]> {
  try {
    const data = await getStopsFn({ data: {} })
    return data as StopWithGuides[]
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw new Error('You must be logged in to view stops')
    }
    throw error
  }
}

export function useStops(): UseStopsReturn {
  const {
    data,
    error,
    isLoading,
    refetch: queryRefetch,
  } = useQuery<StopWithGuides[], Error>({
    queryKey: ['stops'],
    queryFn: fetchStops,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

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
