import { AssetsListConnected } from '@/features/assets/components/assets-list-connected'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsQueryOptions } from '@/features/assets/query-options'
import { sidebarQueryOptions } from '@/features/sidebar/query-options'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_main/assets')({
  loader: async ({ context }) => {
    const sidebarData = await context.queryClient.ensureQueryData(sidebarQueryOptions())
    // Prefetch assets - component will use useSuspenseQuery to consume
    if (sidebarData?.currentTeam?.id) {
      await context.queryClient.ensureQueryData(assetsQueryOptions())
    }
  },
  component: AssetsPage,
  pendingComponent: () =>
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AssetsListSkeleton /> </main>,
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

  const { data } = useSuspenseQuery(assetsQueryOptions())
  const assets = data?.assets ?? []

  const handleAssetDeleted = async (_assetId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
    await queryClient.invalidateQueries({ queryKey: ['guides'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
    await queryClient.invalidateQueries({ queryKey: ['stops'] })
  }

  const handleUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: ['assets'] })
  }

  return (
    <AssetsListConnected
      assets={assets}
      onAssetDeleted={handleAssetDeleted}
      onUploadComplete={handleUploadComplete}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets'] })}
    />
  )
}
