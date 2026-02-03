import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopInput = {
  availableLocales?: string[]
}

export type UpdateStopResult = {
  nanoId: string
  availableLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateStop(stopId: string, input: UpdateStopInput, userId: string): Promise<UpdateStopResult> {
  const [updated] = await db
    .update(stop)
    .set({
      availableLocales: input.availableLocales,
      updatedBy: userId,
    })
    .where(eq(stop.id, stopId))
    .returning({
      nanoId: stop.nanoId,
      availableLocales: stop.availableLocales,
    })

  if (!updated) {
    throw new NotFoundError('Stop')
  }

  return {
    nanoId: updated.nanoId,
    availableLocales: updated.availableLocales ?? [],
  }
}
