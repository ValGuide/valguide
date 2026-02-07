import { eq } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { tour } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RecoverTourResult = {
  nanoId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function recoverTour(nanoId: string, userId: string): Promise<RecoverTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  const [updated] = await db
    .update(tour)
    .set({
      archivedAt: null,
      publishedAt: null,
      updatedBy: userId,
    })
    .where(eq(tour.id, tourId))
    .returning({ nanoId: tour.nanoId })

  if (!updated) {
    throw new NotFoundError('Tour')
  }

  return { nanoId: updated.nanoId }
}
