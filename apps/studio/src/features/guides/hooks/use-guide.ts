import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import useSWR, { type KeyedMutator } from 'swr'
import { fetchGuideByNanoId } from '../api/fetchers'

interface UseGuideOptions {
  fallbackData?: GuideWithStopsAndAssets
}

interface UseGuideReturn {
  guide: GuideWithStopsAndAssets | null
  isLoading: boolean
  error: Error | null
  mutate: KeyedMutator<GuideWithStopsAndAssets | null>
}

export function useGuide(nanoId: string, options?: UseGuideOptions): UseGuideReturn {
  const { data, error, isLoading, mutate } = useSWR<GuideWithStopsAndAssets | null>(
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
