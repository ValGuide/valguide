import { eq } from 'drizzle-orm'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { tour } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ArchiveTourResult = {
  nanoId: string
  archivedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function archiveTour(nanoId: string, userId: string): Promise<ArchiveTourResult> {
  const { tourId } = await requireTourAccessByNanoId(nanoId, userId)

  const now = new Date()

  const [updated] = await db
    .update(tour)
    .set({
      archivedAt: now,
      updatedBy: userId,
    })
    .where(eq(tour.id, tourId))
    .returning({ nanoId: tour.nanoId, archivedAt: tour.archivedAt })

  if (!updated || !updated.archivedAt) {
    throw new NotFoundError('Tour')
  }

  return {
    nanoId: updated.nanoId,
    archivedAt: updated.archivedAt,
  }
}
