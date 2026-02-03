import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type ArchiveStopResult = {
  nanoId: string
  archivedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function archiveStop(stopId: string, userId: string): Promise<ArchiveStopResult> {
  const now = new Date()

  const [updated] = await db
    .update(stop)
    .set({
      archivedAt: now,
      updatedBy: userId,
    })
    .where(eq(stop.id, stopId))
    .returning({
      nanoId: stop.nanoId,
      archivedAt: stop.archivedAt,
    })

  if (!updated || !updated.archivedAt) {
    throw new NotFoundError('Stop')
  }

  return {
    nanoId: updated.nanoId,
    archivedAt: updated.archivedAt,
  }
}
