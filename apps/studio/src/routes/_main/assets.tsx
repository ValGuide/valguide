import { createFileRoute } from '@tanstack/react-router'
import { AssetsList } from '@/features/assets/components/assets-list'
import { AssetsListSkeleton } from '@/features/assets/components/assets-list-skeleton'
import { useAssets } from '@/features/assets/hooks/use-assets'
import { assetsQueryOptions } from '@/features/assets/query-options'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { sidebarQueryOptions } from '@/features/sidebar/query-options'

export const Route = createFileRoute('/_main/assets')({
  loader: async ({ context }) => {
    const sidebarData = await context.queryClient.ensureQueryData(sidebarQueryOptions())
    if (sidebarData?.currentTeam?.id) {
      await context.queryClient.ensureQueryData(assetsQueryOptions({ organizationId: sidebarData.currentTeam.id }))
    }
    return { sidebarData }
  },
  component: AssetsPage,
  pendingComponent: AssetsListSkeleton,
})

function AssetsPage() {
  const { data: sidebarData, isLoading: isSidebarLoading } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id

  const {
    assets,
    isLoading: isAssetsLoading,
    error,
    refetch,
  } = useAssets({
    organizationId: organizationId ?? undefined,
  })

  const handleAssetDeleted = (_assetId: string) => {
    refetch()
  }

  const handleUploadComplete = () => {
    refetch()
  }

  const isLoading = isSidebarLoading || isAssetsLoading || !organizationId

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AssetsList
        assets={assets}
        isLoading={isLoading}
        error={error}
        organizationId={organizationId ?? ''}
        onAssetDeleted={handleAssetDeleted}
        onUploadComplete={handleUploadComplete}
        onRetry={refetch}
      />
    </main>
  )
}
