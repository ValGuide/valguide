import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type GetAssetsFilters, getAssets } from './get-assets.server'

const getAssetsSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
})

export const getAssetsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetsSchema)
  .handler(async ({ data, context }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)

    const filters: GetAssetsFilters = { organizationId }
    if (data.type) {
      filters.type = data.type
    }

    return getAssets(filters)
  })
