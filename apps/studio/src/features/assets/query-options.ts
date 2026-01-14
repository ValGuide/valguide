import { queryOptions } from '@tanstack/react-query'
import type { AssetWithUsage } from '@valguide/core/features/assets/queries'
import type { AssetType } from '@valguide/core/features/assets/schema'
import { getAssetsFn } from './server-functions'

export type AssetsQueryOptions = {
  type?: AssetType
  locale?: string
}

export type AssetsResponse = {
  assets: AssetWithUsage[]
}

export const assetsQueryKey = (options?: AssetsQueryOptions) =>
  ['assets', { type: options?.type, locale: options?.locale }] as const

export const assetsQueryOptions = (options?: AssetsQueryOptions) =>
  queryOptions<AssetsResponse>({
    queryKey: assetsQueryKey(options),
    queryFn: () =>
      getAssetsFn({
        data: {
          type: options?.type,
          locale: options?.locale,
        },
      }),
  })
