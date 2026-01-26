import { useQuery } from '@tanstack/react-query'
import type { StopListItem } from '@valguide/core/features/guides/stop/list-stops'
import { useLocale } from '@valguide/core/i18n/client'
import { stopsQueryOptions } from '../query-options'

interface UseStopsReturn {
  stops: StopListItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStops(): UseStopsReturn {
  const locale = useLocale()
  const { data, error, isLoading, refetch: queryRefetch } = useQuery(stopsQueryOptions(locale))

  const refetch = async () => {
    await queryRefetch()
  }

  return {
    stops: data ?? [],
    isLoading,
    error: error ?? null,
    refetch,
  }
}
