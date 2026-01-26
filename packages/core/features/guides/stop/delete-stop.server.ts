import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type DeleteStopResult = {
  nanoId: string
  deletedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteStop(stopId: string, userId: string): Promise<DeleteStopResult> {
  const now = new Date()

  const [updated] = await db
    .update(stop)
    .set({
      deletedAt: now,
      updatedBy: userId,
    })
    .where(eq(stop.id, stopId))
    .returning({
      nanoId: stop.nanoId,
      deletedAt: stop.deletedAt,
    })

  if (!updated || !updated.deletedAt) {
    throw new NotFoundError('Stop')
  }

  return {
    nanoId: updated.nanoId,
    deletedAt: updated.deletedAt,
  }
}
