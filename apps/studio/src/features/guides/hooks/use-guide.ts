import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/types'
import { useCallback } from 'react'
import { getGuideByNanoIdFn } from '../server-functions'

interface UseGuideOptions {
  initialData?: GuideWithStopsAndAssets
}

type MutateFn = (
  data?: GuideWithStopsAndAssets | null | ((prev?: GuideWithStopsAndAssets | null) => GuideWithStopsAndAssets | null),
) => Promise<GuideWithStopsAndAssets | null | undefined>

interface UseGuideReturn {
  guide: GuideWithStopsAndAssets | null
  isLoading: boolean
  error: Error | null
  mutate: MutateFn
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
  const queryClient = useQueryClient()

  const { data, error, isLoading } = useQuery<GuideWithStopsAndAssets | null>({
    queryKey: ['guide', nanoId],
    queryFn: () => fetchGuideByNanoId(nanoId),
    initialData: options?.initialData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 2000,
    placeholderData: keepPreviousData,
  })

  const mutate = useCallback<MutateFn>(
    async (data) => {
      if (typeof data === 'function') {
        const prev = queryClient.getQueryData<GuideWithStopsAndAssets | null>(['guide', nanoId])
        queryClient.setQueryData(['guide', nanoId], data(prev))
      } else if (data !== undefined) {
        queryClient.setQueryData(['guide', nanoId], data)
      }
      await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
      return queryClient.getQueryData<GuideWithStopsAndAssets | null>(['guide', nanoId])
    },
    [queryClient, nanoId],
  )

  return {
    guide: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  }
}
