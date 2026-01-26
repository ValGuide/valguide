import { eq } from 'drizzle-orm'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { guide } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteGuideResult = {
  nanoId: string
  deletedAt: Date
}

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

/**
 * Soft-delete a guide by setting deletedAt.
 * Use for trash functionality - guide can be permanently deleted later.
 */
export async function deleteGuide(nanoId: string, userId: string): Promise<DeleteGuideResult> {
  const { guideId } = await requireGuideAccessByNanoId(nanoId, userId)

  const now = new Date()

  const [updated] = await db
    .update(guide)
    .set({
      deletedAt: now,
      updatedBy: userId,
    })
    .where(eq(guide.id, guideId))
    .returning({ nanoId: guide.nanoId, deletedAt: guide.deletedAt })

  if (!updated || !updated.deletedAt) {
    throw new NotFoundError('Guide')
  }

  return {
    nanoId: updated.nanoId,
    deletedAt: updated.deletedAt,
  }
}

/**
 * Permanently delete a guide and all related data.
 * Use with caution - this cannot be undone.
 */
export async function permanentlyDeleteGuide(nanoId: string, userId: string): Promise<void> {
  const { guideId } = await requireGuideAccessByNanoId(nanoId, userId)

  await db.delete(guide).where(eq(guide.id, guideId))
}
