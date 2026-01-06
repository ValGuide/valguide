import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import useSWR from 'swr'
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
  const key = 'archived-guides'
  const { data, error, isLoading, mutate } = useSWR<ArchivedGuidesResponse>(key, fetchArchivedGuides, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const refetch = async () => {
    await mutate()
  }

  return {
    data,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
