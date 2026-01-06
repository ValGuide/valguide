import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import useSWR from 'swr'
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
  const key = enabled ? ['assets', options?.type, options?.locale, options?.organizationId] : null

  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(key, () => fetchAssets(options), {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })

  return {
    assets: data?.assets ?? [],
    error,
    isLoading,
    refetch: mutate,
  }
}
