import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Asset = typeof asset.$inferSelect

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

export async function getAssetByNanoId(nanoId: string): Promise<Asset | undefined> {
  return db.query.asset.findFirst({
    where: eq(asset.nanoId, nanoId),
  })
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  return db.query.asset.findFirst({
    where: eq(asset.id, id),
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getAssetSchema = z.object({
  nanoId: z.string(),
})

export const getAssetFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getAssetSchema)
  .handler(async ({ context, data }) => {
    const foundAsset = await getAssetByNanoId(data.nanoId)
    if (!foundAsset) {
      throw new NotFoundError('Asset')
    }
    await requireAssetAccess(foundAsset.id, context.user.id)
    return foundAsset
  })
