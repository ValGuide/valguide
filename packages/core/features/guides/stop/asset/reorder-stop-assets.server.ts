import { eq, inArray } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ReorderStopAssetsInput = {
  orderedIds: string[]
}

export type ReorderStopAssetsResult = {
  reordered: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function reorderStopAssets(
  stopNanoId: string,
  input: ReorderStopAssetsInput,
): Promise<ReorderStopAssetsResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  // Verify all IDs belong to this stop
  const existing = await db
    .select({ id: stopAssetDraft.id })
    .from(stopAssetDraft)
    .where(inArray(stopAssetDraft.id, input.orderedIds))

  const existingIds = new Set(existing.map((e) => e.id))
  const validIds = input.orderedIds.filter((id) => existingIds.has(id))

  // Update positions
  let reordered = 0
  for (let i = 0; i < validIds.length; i++) {
    await db.update(stopAssetDraft).set({ position: i }).where(eq(stopAssetDraft.id, validIds[i]))
    reordered++
  }

  return { reordered }
}
