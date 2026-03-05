import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import type { AssetType } from '@valguide/core/features/assets/types'
import { Suspense, useDeferredValue, useState } from 'react'
import { AssetCardConnected } from '@/features/assets/components/asset-card-connected.tsx'
import { AssetUploadInline } from '@/features/assets/components/asset-upload-inline.tsx'
import { AssetsList } from '@/features/assets/components/assets-list.tsx'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsInfiniteQueryOptions } from '@/features/assets/query-options'

const Root = getRouteApi('/_main')

export const Route = createFileRoute('/_main/assets')({
  loader: ({ context }) => context.queryClient.ensureInfiniteQueryData(assetsInfiniteQueryOptions()),
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
      <Suspense fallback={<AssetsListSkeleton />}>
        <AssetsContent />
      </Suspense>
    </main>
  )
}

function AssetsContent() {
  const queryClient = useQueryClient()
  const organizationId = Root.useRouteContext().team.teamId
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    assetsInfiniteQueryOptions({
      type: typeFilter === 'all' ? undefined : typeFilter,
      search: deferredSearchQuery.trim() || undefined,
    }),
  )
  const assets = data.pages.flatMap((page) => page.items)

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

  return organizationId ? (
    <AssetsList
      organizationId={organizationId}
      assets={assets}
      hasMore={hasNextPage}
      isFetchingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
      onAssetDeleted={handleAssetDeleted}
      onUploadComplete={handleUploadComplete}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets-infinite'] })}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      AssetCard={AssetCardConnected}
      UploadInline={AssetUploadInline}
    />
  ) : null
}
