import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'

export type { DeleteAssetResult } from './delete-asset.server'

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetSchema)
  .handler(async ({ context, data }) => {
    const [{ requireAssetAccess }, { deleteAsset }] = await Promise.all([
      import('../auth/authorization'),
      import('./delete-asset.server'),
    ])

    await requireAssetAccess(data.assetId, context.user.id)
    return deleteAsset(data.assetId)
  })
