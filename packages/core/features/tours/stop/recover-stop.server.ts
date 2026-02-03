import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RecoverStopResult = {
  nanoId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function recoverStop(stopId: string, userId: string): Promise<RecoverStopResult> {
  const [updated] = await db
    .update(stop)
    .set({
      archivedAt: null,
      updatedBy: userId,
    })
    .where(eq(stop.id, stopId))
    .returning({
      nanoId: stop.nanoId,
    })

  if (!updated) {
    throw new NotFoundError('Stop')
  }

  return {
    nanoId: updated.nanoId,
  }
}
