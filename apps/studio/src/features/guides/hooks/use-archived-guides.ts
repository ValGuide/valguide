import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { getArchivedGuidesFn } from '../server-functions'

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslations[]
  userId: string
}

interface UseArchivedGuidesReturn {
  data: ArchivedGuidesResponse | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

async function fetchArchivedGuides(): Promise<ArchivedGuidesResponse> {
  const data = await getArchivedGuidesFn()
  return data
}

export function useArchivedGuides(): UseArchivedGuidesReturn {
  const {
    data,
    error,
    isLoading,
    refetch: queryRefetch,
  } = useQuery<ArchivedGuidesResponse>({
    queryKey: ['archived-guides'],
    queryFn: fetchArchivedGuides,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

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
