import { eq } from 'drizzle-orm'
import { db } from '../db'
import { asset } from './schema'

export type RenameAssetInput = {
  assetId: string
  fileName: string
}

export async function renameAsset(input: RenameAssetInput) {
  const [renamedAsset] = await db
    .update(asset)
    .set({
      fileName: input.fileName,
    })
    .where(eq(asset.id, input.assetId))
    .returning()

  return renamedAsset
}
