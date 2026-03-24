import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import type { AssetUsageDetails } from './get-asset-usage.server'

export type { AssetUsageDetails } from './get-asset-usage.server'

const getAssetUsageSchema = z.object({
  assetId: z.string(),
})

export const getAssetUsageDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetUsageSchema)
  .handler(async ({ context, data }): Promise<AssetUsageDetails> => {
    const [{ requireAssetAccess }, { getAssetUsage }] = await Promise.all([
      import('../auth/authorization'),
      import('./get-asset-usage.server'),
    ])

    await requireAssetAccess(data.assetId, context.user.id)
    return getAssetUsage(data.assetId)
  })
