import { queryOptions } from '@tanstack/react-query'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'
import { getAssetsFn } from './server-functions'

export type AssetsQueryOptions = {
  type?: AssetType
  locale?: string
  organizationId?: string
}

export type AssetsResponse = {
  assets: Asset[]
}

export const assetsQueryKey = (options?: AssetsQueryOptions) =>
  ['assets', { type: options?.type, locale: options?.locale, organizationId: options?.organizationId }] as const

export const assetsQueryOptions = (options?: AssetsQueryOptions) =>
  queryOptions<AssetsResponse>({
    queryKey: assetsQueryKey(options),
    queryFn: () =>
      getAssetsFn({
        data: {
          type: options?.type,
          locale: options?.locale,
          organizationId: options?.organizationId,
        },
      }),
  })
