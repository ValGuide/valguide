import { createServerFn } from '@tanstack/react-start'
import { type GetAssetsFilters, getAssets } from '@valguide/core/features/assets/queries'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/studio/features/auth/server-functions'
import { z } from 'zod'

const getAssetsInputSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
  locale: z.string().optional(),
  organizationId: z.string().optional(),
})

export const getAssetsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetsInputSchema)
  .handler(
    handleError(async ({ data, context }) => {
      const user = context.user
      const filters: GetAssetsFilters = {}

      if (data.type) {
        filters.type = data.type
      }
      if (data.locale) {
        filters.locale = data.locale
      }
      if (data.organizationId) {
        filters.organizationId = data.organizationId
      }

      const assets = await getAssets(filters)

      return { assets }
    }),
  )
