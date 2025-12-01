'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import useSWR, { type KeyedMutator } from 'swr'
import { fetchGuideByNanoId } from '../api/fetchers'

interface UseGuideOptions {
  fallbackData?: GuideWithStops
}

interface UseGuideReturn {
  guide: GuideWithStops | null
  isLoading: boolean
  error: Error | null
  mutate: KeyedMutator<GuideWithStops | null>
}

export function useGuide(nanoId: string, options?: UseGuideOptions): UseGuideReturn {
  const { data, error, isLoading, mutate } = useSWR<GuideWithStops | null>(
    `/api/guides/${nanoId}`,
    fetchGuideByNanoId,
    {
      fallbackData: options?.fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    },
  )

  return {
    guide: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  }
}
