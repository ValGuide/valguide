import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import type { AssetSortBy, AssetSortDirection } from '@valguide/core/features/assets/get-assets.fn'
import type { AssetType } from '@valguide/core/features/assets/types'
import { AssetCardConnected } from '@/features/assets/components/asset-card-connected.tsx'
import { AssetUploadInline } from '@/features/assets/components/asset-upload-inline.tsx'
import { AssetsList } from '@/features/assets/components/assets-list.tsx'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsInfiniteQueryOptions } from '@/features/assets/query-options'

const Root = getRouteApi('/_main')

const assetTypeValues: readonly ['all', 'image', 'audio', 'video'] = ['all', 'image', 'audio', 'video']
const sortByValues: readonly AssetSortBy[] = ['createdAt', 'name']
const sortDirectionValues: readonly AssetSortDirection[] = ['asc', 'desc']

type AssetsSearchParams = {
  type?: AssetType | 'all'
  query?: string
  sortBy?: AssetSortBy
  sortDirection?: AssetSortDirection
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

export const Route = createFileRoute('/_main/assets')({
  validateSearch: (search: Record<string, unknown>): AssetsSearchParams => ({
    type: parseAssetType(search.type),
    query: typeof search.query === 'string' ? search.query : undefined,
    sortBy: parseSortBy(search.sortBy),
    sortDirection: parseSortDirection(search.sortDirection),
  }),
  loader: ({ context, location }) => {
    const search = location.search as AssetsSearchParams
    return context.queryClient.ensureInfiniteQueryData(
      assetsInfiniteQueryOptions({
        type: search.type === 'all' ? undefined : search.type,
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
  const searchQuery = routeSearch.query ?? ''
  const sortBy = routeSearch.sortBy ?? 'createdAt'
  const sortDirection = routeSearch.sortDirection ?? 'desc'
  const canonicalSearchQuery = searchQuery.trim() || undefined

  const updateSearch = (nextSearch: AssetsSearchParams) => {
    const mergedSearch: AssetsSearchParams = {
      type: routeSearch.type,
      query: routeSearch.query,
      sortBy: routeSearch.sortBy,
      sortDirection: routeSearch.sortDirection,
      ...nextSearch,
    }

    void navigate({
      to: '/assets',
      search: {
        type: mergedSearch.type,
        query: mergedSearch.query,
        sortBy: mergedSearch.sortBy,
        sortDirection: mergedSearch.sortDirection,
      },
      replace: true,
      viewTransition: false,
    })
  }

  const { data, error, hasNextPage, isFetchingNextPage, isPending, fetchNextPage } = useInfiniteQuery({
    ...assetsInfiniteQueryOptions({
      type: typeFilter === 'all' ? undefined : typeFilter,
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
      AssetCard={AssetCardConnected}
      UploadInline={AssetUploadInline}
    />
  ) : null
}
