import { useQuery } from '@tanstack/react-query'
import type { ArchivedGuideListItem } from '@valguide/core/features/guides/guide/list-archived-guides.server'
import { archivedGuidesQueryOptions } from '../query-options'

interface UseArchivedGuidesReturn {
  guides: ArchivedGuideListItem[]
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
    guides: data ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
