import { useQuery } from '@tanstack/react-query'
import { type ArchivedGuidesResponse, archivedGuidesQueryOptions } from '../query-options'

interface UseArchivedGuidesReturn {
  data: ArchivedGuidesResponse | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useArchivedGuides(): UseArchivedGuidesReturn {
  const { data, error, isLoading, refetch: queryRefetch } = useQuery(archivedGuidesQueryOptions())

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    data,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
