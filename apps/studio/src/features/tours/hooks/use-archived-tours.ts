import { useQuery } from '@tanstack/react-query'
import type { ArchivedTourListItem } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import { archivedToursQueryOptions } from '../query-options'

interface UseArchivedToursReturn {
  tours: ArchivedTourListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useArchivedTours(): UseArchivedToursReturn {
  const { data, error, isLoading, refetch: queryRefetch } = useQuery(archivedToursQueryOptions())

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    tours: data ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
