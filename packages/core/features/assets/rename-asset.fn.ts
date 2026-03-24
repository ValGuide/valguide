import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'

const renameAssetSchema = z.object({
  assetId: z.string(),
  fileName: z.string().trim().min(1).max(500),
})

export const renameAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(renameAssetSchema)
  .handler(async ({ data, context }) => {
    const [{ NotFoundError, requireAssetAccess }, { renameAsset }] = await Promise.all([
      import('../auth/authorization'),
      import('./rename-asset.server'),
    ])

    await requireAssetAccess(data.assetId, context.user.id)

    const renamedAsset = await renameAsset({
      assetId: data.assetId,
      fileName: data.fileName,
    })

    if (!renamedAsset) {
      throw new NotFoundError('Asset')
    }

    return renamedAsset
  })
