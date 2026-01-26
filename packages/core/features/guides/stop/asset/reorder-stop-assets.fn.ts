import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { reorderStopAssets } from './reorder-stop-assets.server'

export type { ReorderStopAssetsInput, ReorderStopAssetsResult } from './reorder-stop-assets.server'

const reorderStopAssetsSchema = z.object({
	nanoId: z.string(),
	orderedIds: z.array(z.string()),
})

export const reorderStopAssetsFn = createServerFn({ method: 'POST' })
	.middleware([requireAuthMiddleware])
	.inputValidator(reorderStopAssetsSchema)
	.handler(async ({ context, data }) => {
		await requireStopAccessByNanoId(data.nanoId, context.user.id)

		return reorderStopAssets(data.nanoId, { orderedIds: data.orderedIds })
	})
