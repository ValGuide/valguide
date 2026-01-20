import { createServerFn } from '@tanstack/react-start'
import { type GetAssetsFilters, getAssets } from '@valguide/core/features/assets/queries'
import { requireOrgMember } from '@valguide/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

const getAssetsInputSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
  locale: z.string().optional(),
})

export const getAssetsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetsInputSchema)
  .handler(async ({ data, context }) => {
    const organizationId = context.activeOrgId!
    await requireOrgMember(organizationId, context.user.id)
    const filters: GetAssetsFilters = {
      organizationId,
    }

    if (data.type) {
      filters.type = data.type
    }
    if (data.locale) {
      filters.locale = data.locale
    }

    const assets = await getAssets(filters)

    return { assets }
  })
