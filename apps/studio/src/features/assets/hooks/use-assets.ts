import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type AssetsQueryOptions, assetsQueryKey, assetsQueryOptions } from '../query-options'

type UseAssetsOptions = AssetsQueryOptions & {
  enabled?: boolean
}

export function useAssets(options?: UseAssetsOptions) {
  const enabled = options?.enabled ?? true
  const queryClient = useQueryClient()

  const { data, error, isLoading } = useQuery({
    ...assetsQueryOptions(options),
    enabled,
  })

  return {
    assets: data?.assets ?? [],
    error,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: assetsQueryKey(options) }),
  }
}
