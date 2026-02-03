import { eq, inArray } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { tour, tourAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ReorderTourAssetsInput = {
  orderedIds: string[]
}

export type ReorderTourAssetsResult = {
  reordered: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function reorderTourAssets(
  tourNanoId: string,
  input: ReorderTourAssetsInput,
): Promise<ReorderTourAssetsResult> {
  const [foundTour] = await db.select({ id: tour.id }).from(tour).where(eq(tour.nanoId, tourNanoId)).limit(1)

  if (!foundTour) {
    throw new NotFoundError('Guide')
  }

  // Verify all IDs belong to this guide
  const existing = await db
    .select({ id: tourAssetDraft.id })
    .from(tourAssetDraft)
    .where(inArray(tourAssetDraft.id, input.orderedIds))

  const existingIds = new Set(existing.map((e) => e.id))
  const validIds = input.orderedIds.filter((id) => existingIds.has(id))

  // Update positions
  let reordered = 0
  for (let i = 0; i < validIds.length; i++) {
    await db.update(tourAssetDraft).set({ position: i }).where(eq(tourAssetDraft.id, validIds[i]))
    reordered++
  }

  return { reordered }
}
