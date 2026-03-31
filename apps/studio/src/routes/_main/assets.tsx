import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import type { AssetSortBy, AssetSortDirection, AssetUsageFilter } from '@valguide/core/features/assets/get-assets.fn'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { useEffect, useState } from 'react'
import { AssetCardConnected } from '@/features/assets/components/asset-card-connected.tsx'
import { AssetListRowConnected } from '@/features/assets/components/asset-list-row-connected.tsx'
import { AssetsList } from '@/features/assets/components/assets-list.tsx'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { BulkDeleteAssetsDialogConnected } from '@/features/assets/components/bulk-delete-assets-dialog-connected.tsx'
import {
  assetDetailsQueryKey,
  assetDetailsQueryOptions,
  assetsInfiniteQueryOptions,
} from '@/features/assets/query-options'

const Root = getRouteApi('/_main')

const assetTypeValues: readonly ['all', 'image', 'audio', 'video', 'document'] = [
  'all',
  'image',
  'audio',
  'video',
  'document',
]
const usageFilterValues: readonly ['all', 'used', 'unused'] = ['all', 'used', 'unused']
const sortByValues: readonly AssetSortBy[] = ['createdAt', 'name', 'usage']
const sortDirectionValues: readonly AssetSortDirection[] = ['asc', 'desc']
const viewModeValues: readonly ['grid', 'list'] = ['grid', 'list']

type AssetViewMode = (typeof viewModeValues)[number]

type AssetsSearchParams = {
  asset?: string
  type?: AssetType | 'all'
  usage?: AssetUsageFilter | 'all'
  query?: string
  sortBy?: AssetSortBy
  sortDirection?: AssetSortDirection
  view?: AssetViewMode
}

const parseAssetType = (value: unknown): AssetType | 'all' | undefined => {
  return typeof value === 'string' && assetTypeValues.includes(value as (typeof assetTypeValues)[number])
    ? (value as AssetType | 'all')
    : undefined
}

const parseSortBy = (value: unknown): AssetSortBy | undefined => {
  return typeof value === 'string' && sortByValues.includes(value as AssetSortBy) ? (value as AssetSortBy) : undefined
}

const parseSortDirection = (value: unknown): AssetSortDirection | undefined => {
  return typeof value === 'string' && sortDirectionValues.includes(value as AssetSortDirection)
    ? (value as AssetSortDirection)
    : undefined
}

const parseUsageFilter = (value: unknown): AssetUsageFilter | 'all' | undefined => {
  return typeof value === 'string' && usageFilterValues.includes(value as (typeof usageFilterValues)[number])
    ? (value as AssetUsageFilter | 'all')
    : undefined
}

const parseViewMode = (value: unknown): AssetViewMode | undefined => {
  return typeof value === 'string' && viewModeValues.includes(value as AssetViewMode)
    ? (value as AssetViewMode)
    : undefined
}

const parseSelectedAsset = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

export const Route = createFileRoute('/_main/assets')({
  validateSearch: (search: Record<string, unknown>): AssetsSearchParams => ({
    asset: parseSelectedAsset(search.asset),
    type: parseAssetType(search.type),
    usage: parseUsageFilter(search.usage),
    query: typeof search.query === 'string' ? search.query : undefined,
    sortBy: parseSortBy(search.sortBy),
    sortDirection: parseSortDirection(search.sortDirection),
    view: parseViewMode(search.view),
  }),
  loader: ({ context, location }) => {
    const search = location.search as AssetsSearchParams
    const assetsQuery = context.queryClient.ensureInfiniteQueryData(
      assetsInfiniteQueryOptions({
        type: search.type === 'all' ? undefined : search.type,
        usage: search.usage === 'all' ? undefined : search.usage,
        search: search.query?.trim() || undefined,
        sortBy: search.sortBy ?? 'createdAt',
        sortDirection: search.sortDirection ?? 'desc',
      }),
    )

    if (!search.asset) {
      return assetsQuery
    }

    return Promise.all([assetsQuery, context.queryClient.ensureQueryData(assetDetailsQueryOptions(search.asset))])
  },
  component: AssetsPage,
  pendingComponent: () => (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AssetsListSkeleton />
    </main>
  ),
})

function AssetsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AssetsContent />
    </main>
  )
}

function AssetsContent() {
  const queryClient = useQueryClient()
  const navigate = Route.useNavigate()
  const routeSearch = Route.useSearch()
  const organizationId = Root.useRouteContext().currentTeam?.id

  const typeFilter = routeSearch.type ?? 'all'
  const usageFilter = routeSearch.usage ?? 'all'
  const searchQuery = routeSearch.query ?? ''
  const sortBy = routeSearch.sortBy ?? 'createdAt'
  const sortDirection = routeSearch.sortDirection ?? 'desc'
  const viewMode = routeSearch.view ?? 'grid'
  const canonicalSearchQuery = searchQuery.trim() || undefined

  const updateSearch = (nextSearch: AssetsSearchParams) => {
    const mergedSearch: AssetsSearchParams = {
      type: routeSearch.type,
      asset: routeSearch.asset,
      query: routeSearch.query,
      usage: routeSearch.usage,
      sortBy: routeSearch.sortBy,
      sortDirection: routeSearch.sortDirection,
      view: routeSearch.view,
      ...nextSearch,
    }

    void navigate({
      to: '/assets',
      search: {
        asset: mergedSearch.asset,
        type: mergedSearch.type,
        query: mergedSearch.query,
        usage: mergedSearch.usage,
        sortBy: mergedSearch.sortBy,
        sortDirection: mergedSearch.sortDirection,
        view: mergedSearch.view,
      },
      replace: true,
      viewTransition: false,
    })
  }

  const [searchDraft, setSearchDraft] = useState(searchQuery)

  useEffect(() => {
    setSearchDraft(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = searchDraft.trim()
      const currentQuery = searchQuery.trim()

      if (nextQuery !== currentQuery) {
        updateSearch({
          query: nextQuery.length > 0 ? nextQuery : undefined,
        })
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchDraft, searchQuery])

  const { data, error, hasNextPage, isFetchingNextPage, isPending, fetchNextPage } = useInfiniteQuery({
    ...assetsInfiniteQueryOptions({
      type: typeFilter === 'all' ? undefined : typeFilter,
      usage: usageFilter === 'all' ? undefined : usageFilter,
      search: canonicalSearchQuery,
      sortBy,
      sortDirection,
    }),
    placeholderData: (previousData) => previousData,
  })

  const assets = data?.pages.flatMap((page) => page.items) ?? []
  const selectedAssetNanoId = routeSearch.asset
  const selectedAssetFromList = assets.find((asset) => asset.nanoId === selectedAssetNanoId) ?? null
  const { data: selectedAssetDetails } = useQuery({
    ...assetDetailsQueryOptions(selectedAssetNanoId ?? ''),
    enabled: Boolean(selectedAssetNanoId),
    placeholderData: selectedAssetFromList ?? undefined,
  })
  const selectedAsset = selectedAssetDetails ?? selectedAssetFromList

  const handleAssetDeleted = async (_assetId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-tours'] })
    await queryClient.invalidateQueries({ queryKey: ['stops'] })
  }

  const handleAssetsDeleted = async (_assetIds: string[]) => {
    await handleAssetDeleted('')
  }

  const handleAssetRenamed = async (renamedAsset: Asset) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
    queryClient.setQueryData(assetDetailsQueryKey(renamedAsset.nanoId), (currentAsset) =>
      currentAsset
        ? {
            ...currentAsset,
            fileName: renamedAsset.fileName,
            updatedAt: renamedAsset.updatedAt,
          }
        : currentAsset,
    )
  }

  if (isPending && !data) {
    return <AssetsListSkeleton />
  }

  return organizationId ? (
    <AssetsList
      assets={assets}
      hasMore={hasNextPage}
      isFetchingMore={isFetchingNextPage}
      isQueryPending={isPending}
      error={error}
      onLoadMore={() => void fetchNextPage()}
      onAssetDeleted={handleAssetDeleted}
      onAssetsDeleted={handleAssetsDeleted}
      onAssetRenamed={handleAssetRenamed}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })}
      selectedAsset={selectedAsset}
      isDetailsOpen={Boolean(selectedAssetNanoId)}
      onDetailsOpenChange={(open) => {
        if (open) {
          return
        }

        updateSearch({
          asset: undefined,
        })
      }}
      onOpenAssetDetails={(asset) =>
        updateSearch({
          asset: asset.nanoId,
        })
      }
      typeFilter={typeFilter}
      onTypeFilterChange={(nextTypeFilter) =>
        updateSearch({
          type: nextTypeFilter === 'all' ? undefined : nextTypeFilter,
        })
      }
      searchQuery={searchDraft}
      onSearchQueryChange={setSearchDraft}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={(nextSortBy, nextSortDirection) =>
        updateSearch({
          sortBy: nextSortBy === 'createdAt' ? undefined : nextSortBy,
          sortDirection: nextSortDirection === 'desc' ? undefined : nextSortDirection,
        })
      }
      usageFilter={usageFilter}
      onUsageFilterChange={(nextUsageFilter) =>
        updateSearch({
          usage: nextUsageFilter === 'all' ? undefined : nextUsageFilter,
        })
      }
      viewMode={viewMode}
      onViewModeChange={(nextViewMode) =>
        updateSearch({
          view: nextViewMode === 'grid' ? undefined : nextViewMode,
        })
      }
      onClearAllFilters={() =>
        updateSearch({
          type: undefined,
          usage: undefined,
          sortBy: undefined,
          sortDirection: undefined,
        })
      }
      AssetCard={AssetCardConnected}
      AssetListRow={AssetListRowConnected}
      BulkDeleteDialog={BulkDeleteAssetsDialogConnected}
    />
  ) : null
}
