import { createServerFn } from '@tanstack/react-start'
import { and, countDistinct, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { guideAsset, stopAsset } from '../guides/schema'
import { type AssetType, asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GetAssetsFilters = {
  type?: AssetType
  organizationId?: string
  uploadedBy?: string
}

export type AssetWithUsage = typeof asset.$inferSelect & {
  guideCount: number
  stopCount: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getAssets(filters?: GetAssetsFilters): Promise<AssetWithUsage[]> {
  const conditions = []

  if (filters?.type) {
    conditions.push(eq(asset.type, filters.type))
  }
  if (filters?.organizationId) {
    conditions.push(eq(asset.organizationId, filters.organizationId))
  }
  if (filters?.uploadedBy) {
    conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
  }

  const guideCountSq = db
    .select({ count: countDistinct(guideAsset.guideId) })
    .from(guideAsset)
    .where(eq(guideAsset.assetId, asset.id))

  const stopCountSq = db
    .select({ count: countDistinct(stopAsset.stopId) })
    .from(stopAsset)
    .where(eq(stopAsset.assetId, asset.id))

  const query = db
    .select({
      ...getTableColumns(asset),
      guideCount: sql<number>`COALESCE(${guideCountSq}, 0)`.as('guide_count'),
      stopCount: sql<number>`COALESCE(${stopCountSq}, 0)`.as('stop_count'),
    })
    .from(asset)
    .orderBy(desc(asset.createdAt))

  if (conditions.length > 0) {
    return query.where(and(...conditions))
  }

  return query
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

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
