import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopSettingsDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopSettingsDraftInput = {
  coordinates?: string | null
  settingsJson?: string | null
}

export type UpdateStopSettingsDraftResult = {
  id: string
  updatedAt: Date
}

// =============================================================================
// SERVER LOGIC
// =============================================================================

export async function updateStopSettingsDraft(
  stopNanoId: string,
  input: UpdateStopSettingsDraftInput,
  userId: string,
): Promise<UpdateStopSettingsDraftResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [updated] = await db
    .update(stopSettingsDraft)
    .set({
      coordinates: input.coordinates,
      settingsJson: input.settingsJson,
      updatedBy: userId,
    })
    .where(eq(stopSettingsDraft.stopId, foundStop.id))
    .returning({
      id: stopSettingsDraft.id,
      updatedAt: stopSettingsDraft.updatedAt,
    })

  if (!updated) {
    throw new NotFoundError('Stop settings draft')
  }

  return updated
}
