import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import type { BulkAssetDeletionPreview } from './get-bulk-asset-deletion-preview.server'

export type { AssetDeletionEligibility, AssetUsageLocation, AssetUsageScope } from './asset-deletion-eligibility.server'
export type { BulkAssetDeletionPreview } from './get-bulk-asset-deletion-preview.server'

const getBulkAssetDeletionPreviewSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(200),
})

export const getBulkAssetDeletionPreviewFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getBulkAssetDeletionPreviewSchema)
  .handler(async ({ context, data }): Promise<BulkAssetDeletionPreview> => {
    const [{ requireOrgMember }, { getBulkAssetDeletionPreview }] = await Promise.all([
      import('../auth/authorization'),
      import('./get-bulk-asset-deletion-preview.server'),
    ])

    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(organizationId, context.user.id)

    return getBulkAssetDeletionPreview(data.assetIds, organizationId)
  })
