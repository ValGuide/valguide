import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import { getAssetsFn } from '../server-functions'

type UseAssetsOptions = {
  type?: AssetType
  locale?: string
  organizationId?: string
  enabled?: boolean
}

type AssetsResponse = {
  assets: Asset[]
}

async function fetchAssets(options?: UseAssetsOptions): Promise<AssetsResponse> {
  const data = await getAssetsFn({
    data: {
      type: options?.type,
      locale: options?.locale,
      organizationId: options?.organizationId,
    },
  })
  return data
}

export function useAssets(options?: UseAssetsOptions) {
  const enabled = options?.enabled ?? true
  const queryKey = ['assets', options?.type, options?.locale, options?.organizationId]
  const queryClient = useQueryClient()

  const { data, error, isLoading } = useQuery<AssetsResponse>({
    queryKey,
    queryFn: () => fetchAssets(options),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  return {
    assets: data?.assets ?? [],
    error,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  }
}
