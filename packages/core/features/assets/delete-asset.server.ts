import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { NotFoundError } from '../auth/authorization'
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
