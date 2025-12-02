'use client'

import useSWR from 'swr'
import { fetchStops, type StopWithGuides } from '../api/fetchers'

interface UseStopsReturn {
  stops: StopWithGuides[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStops(): UseStopsReturn {
  const { data, error, isLoading, mutate } = useSWR<StopWithGuides[]>('/api/stops', fetchStops, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const refetch = async () => {
    await mutate()
  }

  return {
    stops: data ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
