import { type InfiniteData, infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type {
  AssetPage,
  AssetSortBy,
  AssetSortDirection,
  AssetUsageFilter,
  AssetWithUsage,
} from '@valguide/core/features/assets/get-assets.fn'
import { getAssetsFn, getAssetsPageFn } from '@valguide/core/features/assets/get-assets.fn'
import type { AssetType } from '@valguide/core/features/assets/types'

export type AssetsQueryOptions = {
  type?: AssetType
  usage?: AssetUsageFilter
}

export type AssetsInfiniteQueryOptions = {
  type?: AssetType
  usage?: AssetUsageFilter
  search?: string
  pageSize?: number
  sortBy?: AssetSortBy
  sortDirection?: AssetSortDirection
}

export type AssetsResponse = {
  assets: AssetWithUsage[]
}

export const assetsQueryKey = (options?: AssetsQueryOptions) =>
  ['assets', { type: options?.type, usage: options?.usage ?? null }] as const

export const assetsQueryOptions = (options?: AssetsQueryOptions) =>
  queryOptions<AssetsResponse>({
    queryKey: assetsQueryKey(options),
    queryFn: async () => {
      const assets = await getAssetsFn({
        data: {
          type: options?.type,
          usage: options?.usage,
        },
      })
      return { assets }
    },
  })

export const assetsInfiniteQueryKey = (options?: AssetsInfiniteQueryOptions) =>
  ['assets-infinite', normalizeAssetsInfiniteOptions(options)] as const

function normalizeAssetsInfiniteOptions(options?: AssetsInfiniteQueryOptions) {
  const normalizedSearch = options?.search?.trim()
  return {
    type: options?.type ?? null,
    usage: options?.usage ?? null,
    search: normalizedSearch && normalizedSearch.length > 0 ? normalizedSearch : null,
    pageSize: options?.pageSize ?? 60,
    sortBy: options?.sortBy ?? 'createdAt',
    sortDirection: options?.sortDirection ?? 'desc',
  } as const
}

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
    queryFn: async ({ pageParam }) => {
      const normalizedOptions = normalizeAssetsInfiniteOptions(options)
      return getAssetsPageFn({
        data: {
          type: normalizedOptions.type ?? undefined,
          usage: normalizedOptions.usage ?? undefined,
          search: normalizedOptions.search ?? undefined,
          cursor: pageParam,
          limit: normalizedOptions.pageSize,
          sortBy: normalizedOptions.sortBy,
          sortDirection: normalizedOptions.sortDirection,
        },
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
