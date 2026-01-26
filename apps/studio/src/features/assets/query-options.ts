import { queryOptions } from '@tanstack/react-query'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets'
import { getAssetsFn } from '@valguide/core/features/assets/get-assets'
import type { AssetType } from '@valguide/core/features/assets/schema'

export type AssetsQueryOptions = {
  type?: AssetType
}

export type AssetsResponse = {
  assets: AssetWithUsage[]
}

export const assetsQueryKey = (options?: AssetsQueryOptions) => ['assets', { type: options?.type }] as const

export const assetsQueryOptions = (options?: AssetsQueryOptions) =>
  queryOptions<AssetsResponse>({
    queryKey: assetsQueryKey(options),
    queryFn: async () => {
      const assets = await getAssetsFn({
        data: {
          type: options?.type,
        },
      })
      return { assets }
    },
  })
