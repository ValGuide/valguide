import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getAssetByNanoId } from './get-asset.server'

export type { Asset } from './get-asset.server'

const getAssetSchema = z.object({
  nanoId: z.string(),
})

export const getAssetFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetSchema)
  .handler(async ({ context, data }) => {
    const foundAsset = await getAssetByNanoId(data.nanoId)
    if (!foundAsset) {
      throw new NotFoundError('Asset')
    }
    await requireAssetAccess(foundAsset.id, context.user.id)
    return foundAsset
  })
