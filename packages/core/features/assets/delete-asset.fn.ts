import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { deleteAsset } from './delete-asset.server'

export type { DeleteAssetResult } from './delete-asset.server'

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetSchema)
  .handler(async ({ context, data }) => {
    await requireAssetAccess(data.assetId, context.user.id)
    return deleteAsset(data.assetId)
  })
