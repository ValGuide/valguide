import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { asset } from './schema'

export type AssetType = 'image' | 'audio' | 'video'

const confirmAssetUploadSchema = z.object({
  assetId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(['image', 'audio', 'video']),
  locale: z.string().optional(),
  storagePath: z.string(),
  organizationId: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export type ConfirmAssetUploadParams = z.infer<typeof confirmAssetUploadSchema>

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .inputValidator(confirmAssetUploadSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims

    if (!user) throw new Error('Not authenticated')

    const {
      assetId,
      fileName,
      fileSize,
      mimeType,
      type,
      locale,
      storagePath,
      organizationId,
      width,
      height,
      duration,
    } = data

    const {
      data: { publicUrl },
    } = supabase.storage.from('assets').getPublicUrl(storagePath)

    const [newAsset] = await db
      .insert(asset)
      .values({
        nanoId: assetId,
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
  })

const deleteAssetSchema = z.object({
  assetId: z.string(),
})

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteAssetSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims

    if (!user) throw new Error('Not authenticated')

    const assetData = await db.query.asset.findFirst({
      where: eq(asset.id, data.assetId),
    })

    if (!assetData) throw new Error('Asset not found')

    if (assetData.uploadedBy !== user.sub) {
      throw new Error('Unauthorized to delete this asset')
    }

    const { error: storageError } = await supabase.storage.from('assets').remove([assetData.storagePath])

    if (storageError) throw storageError

    await db.delete(asset).where(eq(asset.id, data.assetId))

    return { success: true }
  })
