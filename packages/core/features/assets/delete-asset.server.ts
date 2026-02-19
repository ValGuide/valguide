import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { NotFoundError } from '../auth/authorization'
import { db } from '../db'
import { getR2Bucket, getR2Client } from '../storage/r2'
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
  const assetData = await db.query.asset.findFirst({
    where: eq(asset.id, assetId),
  })

  if (!assetData) {
    throw new NotFoundError('Asset')
  }

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getR2Bucket(),
      Key: assetData.storagePath,
    }),
  )

  await db.delete(asset).where(eq(asset.id, assetId))

  return { success: true }
}
