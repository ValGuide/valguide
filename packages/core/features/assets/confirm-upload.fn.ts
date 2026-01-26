import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { type Asset, asset } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type ConfirmUploadInput = {
  assetId: string
  fileName: string
  fileSize: number
  mimeType: string
  type: 'image' | 'audio' | 'video'
  storagePath: string
  width?: number
  height?: number
  duration?: number
}

export type ConfirmUploadResult = Asset

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function confirmUpload(
  input: ConfirmUploadInput,
  organizationId: string,
  userId: string,
): Promise<ConfirmUploadResult> {
  const supabase = await createClient()

  const {
    data: { publicUrl },
  } = supabase.storage.from('assets').getPublicUrl(input.storagePath)

  const [newAsset] = await db
    .insert(asset)
    .values({
      nanoId: input.assetId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      type: input.type,
      storagePath: input.storagePath,
      publicUrl,
      organizationId,
      uploadedBy: userId,
      width: input.width ?? null,
      height: input.height ?? null,
      duration: input.duration ?? null,
    })
    .returning()

  return newAsset
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const confirmUploadSchema = z.object({
  assetId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  type: z.enum(['image', 'audio', 'video']),
  storagePath: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

export const confirmAssetUploadFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(confirmUploadSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)
    return confirmUpload(data, organizationId, context.user.id)
  })
