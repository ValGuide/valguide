'use server'

import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { asset } from './schema'
import { validateFile } from './utils'

export type GetUploadUrlAction = () => Promise<{ token: string; url: string; apiKey: string }>

export const getUploadUrlAction: GetUploadUrlAction = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token
  if (!token) {
    throw Error('Token is null')
  }
  const url = `${process.env.VG_SUPABASE_URL}/storage/v1/upload/resumable`

  const apiKey = process.env.VG_SUPABASE_PUBLISHABLE_KEY
  if (!apiKey) {
    throw Error('VG_SUPABASE_PUBLISHABLE_KEY is not set')
  }
  return { token, url, apiKey }
}

// New asset upload actions

export type AssetType = 'image' | 'audio' | 'video'

export type GetUploadSignedUrlParams = {
  fileName: string
  fileType: string
  type: AssetType
  locale?: string
  organizationId: string
}

export type GetUploadSignedUrlResult = {
  signedUrl: string
  path: string
  token: string
  assetId: string
}

export async function getUploadSignedUrl(params: GetUploadSignedUrlParams): Promise<GetUploadSignedUrlResult> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims

  if (!user) throw new Error('Not authenticated')

  const { fileName, fileType: _fileType, type, locale, organizationId } = params
  const assetId = valguideId()

  // Validate file
  const { sanitizedName } = validateFile(fileName)

  // Construct storage path
  const localePrefix = locale ? `${locale}/` : ''
  const userPrefix = type === 'image' ? `${user.sub}/` : ''
  const storagePath = `${organizationId}/${type}s/${userPrefix}${localePrefix}${assetId}-${sanitizedName}`

  // Generate signed URL (expires in 1 hour)
  const { data, error } = await supabase.storage.from('assets').createSignedUploadUrl(storagePath, {
    upsert: false,
  })

  if (error) throw error

  return {
    signedUrl: data.signedUrl,
    path: storagePath,
    token: data.token,
    assetId,
  }
}

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

export async function getDownloadSignedUrl(assetId: string) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims

  if (!user) throw new Error('Not authenticated')

  const assetData = await db.query.asset.findFirst({
    where: eq(asset.id, assetId),
  })

  if (!assetData) throw new Error('Asset not found')

  // Generate signed download URL (expires in 1 hour)
  const { data, error } = await supabase.storage.from('assets').createSignedUrl(assetData.storagePath, 3600)

  if (error) throw error

  return {
    signedUrl: data.signedUrl,
  }
}
