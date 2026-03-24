import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type DeleteAssetsResult, deleteAssets } from './delete-assets.server'

export type { DeleteAssetsResult } from './delete-assets.server'

const deleteAssetsSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(200),
})

export const deleteAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetsSchema)
  .handler(async ({ context, data }): Promise<DeleteAssetsResult> => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(organizationId, context.user.id)

    return deleteAssets(data.assetIds, organizationId)
  })
