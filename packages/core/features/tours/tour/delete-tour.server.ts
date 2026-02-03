import { eq } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { tour } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteTourResult = {
  nanoId: string
  deletedAt: Date
}

// =============================================================================
// INTERNAL FUNCTIONS
// =============================================================================

/**
 * Soft-delete a tour by setting deletedAt.
 * Use for trash functionality - tour can be permanently deleted later.
 */
export async function deleteTour(nanoId: string, userId: string): Promise<DeleteTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  const now = new Date()

  const [updated] = await db
    .update(tour)
    .set({
      deletedAt: now,
      updatedBy: userId,
    })
    .where(eq(tour.id, tourId))
    .returning({ nanoId: tour.nanoId, deletedAt: tour.deletedAt })

  if (!updated || !updated.deletedAt) {
    throw new NotFoundError('Tour')
  }

  return {
    nanoId: updated.nanoId,
    deletedAt: updated.deletedAt,
  }
}

/**
 * Permanently delete a tour and all related data.
 * Use with caution - this cannot be undone.
 */
export async function permanentlyDeleteTour(nanoId: string, userId: string): Promise<void> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  await db.delete(tour).where(eq(tour.id, tourId))
}
