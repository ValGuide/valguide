import { createFileRoute } from '@tanstack/react-router'

import { AssetsList } from '@/features/assets/components/assets-list'
import { useAssets } from '@/features/assets/hooks/use-assets'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

export const Route = createFileRoute('/assets')({
  component: AssetsPage,
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
