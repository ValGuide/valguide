import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { reorderGuideAssets } from './reorder-guide-assets.server'

export type { ReorderGuideAssetsInput, ReorderGuideAssetsResult } from './reorder-guide-assets.server'

const reorderGuideAssetsSchema = z.object({
  nanoId: z.string(),
  orderedIds: z.array(z.string()),
})

export const reorderGuideAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderGuideAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return reorderGuideAssets(data.nanoId, { orderedIds: data.orderedIds })
  })
