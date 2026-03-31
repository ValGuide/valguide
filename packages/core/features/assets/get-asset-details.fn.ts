import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getAssetWithUsageByNanoId } from './get-assets.server'

export type { AssetWithUsage as AssetDetails } from './get-assets.server'

const getAssetDetailsSchema = z.object({
  nanoId: z.string(),
})

export const getAssetDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetDetailsSchema)
  .handler(async ({ context, data }) => {
    const assetDetails = await getAssetWithUsageByNanoId(data.nanoId)

    if (!assetDetails) {
      throw new NotFoundError('Asset')
    }

    await requireAssetAccess(assetDetails.id, context.user.id)
    return assetDetails
  })
