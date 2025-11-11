'use client'

import { AssetsList } from '@/features/assets/components/assets-list'
import { useAssets } from '@/features/assets/hooks/use-assets'

export function AssetsPageClient() {
  // TODO: Get organizationId from user context/session
  const organizationId = 'org-123'

  const { assets, isLoading, error, refetch } = useAssets({ organizationId })

  const handleAssetDeleted = (assetId: string) => {
    refetch()
  }

  const handleUploadComplete = () => {
    refetch()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AssetsList
        assets={assets}
        isLoading={isLoading}
        error={error}
        organizationId={organizationId}
        onAssetDeleted={handleAssetDeleted}
        onUploadComplete={handleUploadComplete}
      />
    </main>
  )
}
