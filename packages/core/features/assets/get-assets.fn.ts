import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type GetAssetsFilters, type GetAssetsPageFilters, getAssets, getAssetsPage } from './get-assets.server'

export type {
  AssetPage,
  AssetSortBy,
  AssetSortDirection,
  AssetWithUsage,
  GetAssetsFilters,
  GetAssetsPageFilters,
} from './get-assets.server'

const getAssetsSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
})

const getAssetsPageSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(120).optional(),
  sortBy: z.enum(['createdAt', 'name']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
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

export const getAssetsPageFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetsPageSchema)
  .handler(async ({ data, context }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)

    const filters: GetAssetsPageFilters = {
      organizationId,
      cursor: data.cursor,
      limit: data.limit,
      search: data.search,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,
    }
    if (data.type) {
      filters.type = data.type
    }

    return getAssetsPage(filters)
  })
