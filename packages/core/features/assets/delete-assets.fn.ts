import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import type { DeleteAssetsResult } from './delete-assets.server'

export type { DeleteAssetsResult } from './delete-assets.server'

const deleteAssetsSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(200),
})

export const deleteAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetsSchema)
  .handler(async ({ context, data }): Promise<DeleteAssetsResult> => {
    const [{ requireOrgMember }, { deleteAssets }] = await Promise.all([
      import('../auth/authorization'),
      import('./delete-assets.server'),
    ])

    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(organizationId, context.user.id)

    return deleteAssets(data.assetIds, organizationId)
  })
