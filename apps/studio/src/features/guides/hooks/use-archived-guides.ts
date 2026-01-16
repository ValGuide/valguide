import { useQuery } from '@tanstack/react-query'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import { archivedGuidesQueryOptions } from '../query-options'

interface UseArchivedGuidesReturn {
  guides: GuideWithTranslationsAndCover[]
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
    guides: data?.guides ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
