import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { reorderTourAssets } from './reorder-tour-assets.server'

export type { ReorderTourAssetsInput, ReorderTourAssetsResult } from './reorder-tour-assets.server'

const reorderTourAssetsSchema = z.object({
  nanoId: z.string(),
  orderedIds: z.array(z.string()),
})

export const reorderTourAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderTourAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    return reorderTourAssets(data.nanoId, { orderedIds: data.orderedIds })
  })
