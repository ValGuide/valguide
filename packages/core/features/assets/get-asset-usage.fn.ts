import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type AssetUsageDetails, getAssetUsage } from './get-asset-usage.server'

const getAssetUsageSchema = z.object({
  assetId: z.string(),
})

export const getAssetUsageDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetUsageSchema)
  .handler(async ({ context, data }): Promise<AssetUsageDetails> => {
    await requireAssetAccess(data.assetId, context.user.id)
    return getAssetUsage(data.assetId)
  })
