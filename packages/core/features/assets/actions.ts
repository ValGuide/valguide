'use server'

import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { asset } from './schema'
import { validateFile } from './utils'

export type AssetType = 'image' | 'audio' | 'video'

export type ConfirmAssetUploadParams = {
  assetId: string
  fileName: string
  fileSize: number
  mimeType: string
  type: AssetType
  locale?: string
  storagePath: string
  organizationId: string
  width?: number
  height?: number
  duration?: number
}

export async function confirmAssetUpload(params: ConfirmAssetUploadParams) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims

  if (!user) throw new Error('Not authenticated')

  const { assetId, fileName, fileSize, mimeType, type, locale, storagePath, organizationId, width, height, duration } =
    params

  // Get public URL (will respect RLS policies)
  const {
    data: { publicUrl },
  } = supabase.storage.from('assets').getPublicUrl(storagePath)

  // Save to database
  const [newAsset] = await db
    .insert(asset)
    .values({
      // id: auto-generated uuid
      nanoId: assetId, // assetId from client is actually a nanoid
      fileName,
      fileSize,
      mimeType,
      type,
      storagePath,
      publicUrl,
      locale: locale || null,
      organizationId,
      uploadedBy: user.sub,
      width: width || null,
      height: height || null,
      duration: duration || null,
    })
    .returning()

  return newAsset
}

export async function deleteAsset(assetId: string) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims

  if (!user) throw new Error('Not authenticated')

  // Get asset metadata
  const assetData = await db.query.asset.findFirst({
    where: eq(asset.id, assetId),
  })

  if (!assetData) throw new Error('Asset not found')

  // Verify ownership
  if (assetData.uploadedBy !== user.sub) {
    throw new Error('Unauthorized to delete this asset')
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage.from('assets').remove([assetData.storagePath])

  if (storageError) throw storageError

  // Delete from database (cascade will handle relationships)
  await db.delete(asset).where(eq(asset.id, assetId))

  return { success: true }
}
