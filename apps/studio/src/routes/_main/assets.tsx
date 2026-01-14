import { useQueryClient } from '@tanstack/react-query'
import { Await, createFileRoute } from '@tanstack/react-router'
import type { AssetWithUsage } from '@valguide/core/features/assets/queries'
import { Suspense } from 'react'
import { AssetsListConnected } from '@/features/assets/components/assets-list-connected'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { assetsQueryOptions } from '@/features/assets/query-options'
import { sidebarQueryOptions } from '@/features/sidebar/query-options'

export const Route = createFileRoute('/_main/assets')({
  loader: async ({ context }) => {
    const sidebarData = await context.queryClient.ensureQueryData(sidebarQueryOptions())
    // Don't await - return promise for Suspense to handle
    const assetsPromise = sidebarData?.currentTeam?.id
      ? context.queryClient.ensureQueryData(assetsQueryOptions({ organizationId: sidebarData.currentTeam.id }))
      : Promise.resolve([] as AssetWithUsage[])
    return { sidebarData, assetsPromise }
  },
  component: AssetsPage,
})

function AssetsPage() {
  const queryClient = useQueryClient()
  const { sidebarData, assetsPromise } = Route.useLoaderData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''

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
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Suspense fallback={<AssetsListSkeleton />}>
        <Await promise={assetsPromise}>
          {(assets) => (
            <AssetsListConnected
              assets={assets}
              organizationId={organizationId}
              onAssetDeleted={handleAssetDeleted}
              onUploadComplete={handleUploadComplete}
              onRetry={() => queryClient.invalidateQueries({ queryKey: ['assets'] })}
            />
          )}
        </Await>
      </Suspense>
    </main>
  )
}
