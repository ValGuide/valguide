import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireAssetAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteAssetResult = {
  success: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteAsset(assetId: string): Promise<DeleteAssetResult> {
  const supabase = await createClient()

  const assetData = await db.query.asset.findFirst({
    where: eq(asset.id, assetId),
  })

  if (!assetData) {
    throw new NotFoundError('Asset')
  }

  const { error: storageError } = await supabase.storage.from('assets').remove([assetData.storagePath])

  if (storageError) {
    throw storageError
  }

  await db.delete(asset).where(eq(asset.id, assetId))

  return { success: true }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteAssetSchema)
  .handler(async ({ context, data }) => {
    await requireAssetAccess(data.assetId, context.user.id)
    return deleteAsset(data.assetId)
  })
