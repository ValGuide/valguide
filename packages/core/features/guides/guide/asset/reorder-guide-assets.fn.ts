import { createServerFn } from '@tanstack/react-start'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { guide, guideAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ReorderGuideAssetsInput = {
  orderedIds: string[]
}

export type ReorderGuideAssetsResult = {
  reordered: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function reorderGuideAssets(
  guideNanoId: string,
  input: ReorderGuideAssetsInput,
): Promise<ReorderGuideAssetsResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  // Verify all IDs belong to this guide
  const existing = await db
    .select({ id: guideAssetDraft.id })
    .from(guideAssetDraft)
    .where(inArray(guideAssetDraft.id, input.orderedIds))

  const existingIds = new Set(existing.map((e) => e.id))
  const validIds = input.orderedIds.filter((id) => existingIds.has(id))

  // Update positions
  let reordered = 0
  for (let i = 0; i < validIds.length; i++) {
    await db.update(guideAssetDraft).set({ position: i }).where(eq(guideAssetDraft.id, validIds[i]))
    reordered++
  }

  return { reordered }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const reorderGuideAssetsSchema = z.object({
  nanoId: z.string(),
  orderedIds: z.array(z.string()),
})

export const reorderGuideAssetsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderGuideAssetsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return reorderGuideAssets(data.nanoId, { orderedIds: data.orderedIds })
  })
