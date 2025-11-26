'use client'

import useSWR from 'swr'
import { fetchArchivedGuides, ArchivedGuidesResponse } from '../api/fetchers'

interface UseArchivedGuidesReturn {
  data: ArchivedGuidesResponse | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useArchivedGuides(): UseArchivedGuidesReturn {
  const key = '/api/guides/archived'
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
    error: error || null,
    refetch,
  }
}
