import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import type { AssetSortBy, AssetSortDirection, AssetUsageFilter } from '@valguide/core/features/assets/get-assets.fn'
import type { AssetType } from '@valguide/core/features/assets/types'
import { AssetCardConnected } from '@/features/assets/components/asset-card-connected.tsx'
import { AssetListRowConnected } from '@/features/assets/components/asset-list-row-connected.tsx'
import { AssetUploadInline } from '@/features/assets/components/asset-upload-inline.tsx'
import { AssetsList } from '@/features/assets/components/assets-list.tsx'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsInfiniteQueryOptions } from '@/features/assets/query-options'

const Root = getRouteApi('/_main')

const assetTypeValues: readonly ['all', 'image', 'audio', 'video'] = ['all', 'image', 'audio', 'video']
const usageFilterValues: readonly ['all', 'used', 'unused'] = ['all', 'used', 'unused']
const sortByValues: readonly AssetSortBy[] = ['createdAt', 'name', 'usage']
const sortDirectionValues: readonly AssetSortDirection[] = ['asc', 'desc']
const viewModeValues: readonly ['grid', 'list'] = ['grid', 'list']

type AssetViewMode = (typeof viewModeValues)[number]

type AssetsSearchParams = {
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

export const Route = createFileRoute('/_main/assets')({
  validateSearch: (search: Record<string, unknown>): AssetsSearchParams => ({
    type: parseAssetType(search.type),
    usage: parseUsageFilter(search.usage),
    query: typeof search.query === 'string' ? search.query : undefined,
    sortBy: parseSortBy(search.sortBy),
    sortDirection: parseSortDirection(search.sortDirection),
    view: parseViewMode(search.view),
  }),
  loader: ({ context, location }) => {
    const search = location.search as AssetsSearchParams
    return context.queryClient.ensureInfiniteQueryData(
      assetsInfiniteQueryOptions({
        type: search.type === 'all' ? undefined : search.type,
        usage: search.usage === 'all' ? undefined : search.usage,
        search: search.query?.trim() || undefined,
        sortBy: search.sortBy ?? 'createdAt',
        sortDirection: search.sortDirection ?? 'desc',
      }),
    )
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
  const organizationId = Root.useRouteContext().team.teamId

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

  const handleAssetDeleted = async (_assetId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-tours'] })
    await queryClient.invalidateQueries({ queryKey: ['stops'] })
  }

  const handleUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
  }

  const handleAssetRenamed = async (_assetId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })
  }

  if (isPending && !data) {
    return <AssetsListSkeleton />
  }

  return organizationId ? (
    <AssetsList
      organizationId={organizationId}
      assets={assets}
      hasMore={hasNextPage}
      isFetchingMore={isFetchingNextPage}
      isQueryPending={isPending}
      error={error}
      onLoadMore={() => void fetchNextPage()}
      onAssetDeleted={handleAssetDeleted}
      onAssetRenamed={handleAssetRenamed}
      onUploadComplete={handleUploadComplete}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })}
      typeFilter={typeFilter}
      onTypeFilterChange={(nextTypeFilter) =>
        updateSearch({
          type: nextTypeFilter === 'all' ? undefined : nextTypeFilter,
        })
      }
      searchQuery={searchQuery}
      onSearchQueryChange={(nextSearchQuery) =>
        updateSearch({
          query: nextSearchQuery.length > 0 ? nextSearchQuery : undefined,
        })
      }
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
      UploadInline={AssetUploadInline}
    />
  ) : null
}
