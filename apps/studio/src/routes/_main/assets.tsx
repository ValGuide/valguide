import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'
import { AssetCardConnected } from '@/features/assets/components/asset-card-connected.tsx'
import { AssetUploadInline } from '@/features/assets/components/asset-upload-inline.tsx'
import { AssetsList } from '@/features/assets/components/assets-list.tsx'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsQueryOptions } from '@/features/assets/query-options'

const Root = getRouteApi('/_main')

export const Route = createFileRoute('/_main/assets')({
  loader: ({ context }) => context.queryClient.ensureQueryData(assetsQueryOptions()),
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

  const { data } = useSuspenseQuery(assetsQueryOptions())
  const assets = data?.assets ?? []

  const handleAssetDeleted = async (_assetId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-tours'] })
    await queryClient.invalidateQueries({ queryKey: ['stops'] })
  }

  const handleUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
  }

  return organizationId ? (
    <AssetsList
      organizationId={organizationId}
      assets={assets}
      onAssetDeleted={handleAssetDeleted}
      onUploadComplete={handleUploadComplete}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets'] })}
      AssetCard={AssetCardConnected}
      UploadInline={AssetUploadInline}
    />
  ) : null
}
