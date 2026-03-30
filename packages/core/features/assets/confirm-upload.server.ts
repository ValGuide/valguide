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
  type: 'image' | 'audio' | 'video' | 'document'
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
  const [newAsset] = await db
    .insert(asset)
    .values({
      nanoId: input.assetId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      type: input.type,
      storagePath: input.storagePath,
      organizationId,
      uploadedBy: userId,
      width: input.width ?? null,
      height: input.height ?? null,
      duration: input.duration ?? null,
    })
    .returning()

  return newAsset
}
