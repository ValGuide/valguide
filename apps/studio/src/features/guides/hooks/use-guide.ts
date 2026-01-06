import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import useSWR, { type KeyedMutator } from 'swr'
import { getGuideByNanoIdFn } from '../server-functions'

interface UseGuideOptions {
  fallbackData?: GuideWithStopsAndAssets
}

interface UseGuideReturn {
  guide: GuideWithStopsAndAssets | null
  isLoading: boolean
  error: Error | null
  mutate: KeyedMutator<GuideWithStopsAndAssets | null>
}

async function fetchGuideByNanoId(nanoId: string): Promise<GuideWithStopsAndAssets | null> {
  try {
    const guide = await getGuideByNanoIdFn({ data: { nanoId } })
    return guide
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Not found')) {
      return null
    }
    throw error
  }
}

export function useGuide(nanoId: string, options?: UseGuideOptions): UseGuideReturn {
  const { data, error, isLoading, mutate } = useSWR<GuideWithStopsAndAssets | null>(
    ['guide', nanoId],
    () => fetchGuideByNanoId(nanoId),
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
