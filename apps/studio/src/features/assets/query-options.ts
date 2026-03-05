import { type InfiniteData, infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { AssetPage, AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetsFn, getAssetsPageFn } from '@valguide/core/features/assets/get-assets.fn'
import type { AssetType } from '@valguide/core/features/assets/types'

export type AssetsQueryOptions = {
  type?: AssetType
}

export type AssetsInfiniteQueryOptions = {
  type?: AssetType
  search?: string
  pageSize?: number
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

export const assetsInfiniteQueryKey = (options?: AssetsInfiniteQueryOptions) =>
  [
    'assets-infinite',
    {
      type: options?.type ?? null,
      search: options?.search ?? null,
      pageSize: options?.pageSize ?? 60,
    },
  ] as const

export const assetsInfiniteQueryOptions = (options?: AssetsInfiniteQueryOptions) =>
  infiniteQueryOptions<
    AssetPage,
    Error,
    InfiniteData<AssetPage, string | undefined>,
    ReturnType<typeof assetsInfiniteQueryKey>,
    string | undefined
  >({
    queryKey: assetsInfiniteQueryKey(options),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) =>
      getAssetsPageFn({
        data: {
          type: options?.type,
          search: options?.search,
          cursor: pageParam,
          limit: options?.pageSize ?? 60,
        },
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
