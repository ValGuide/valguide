import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
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
// INTERNAL FUNCTION
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateStopSettingsDraftSchema = z.object({
  nanoId: z.string(),
  coordinates: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
})

export const updateStopSettingsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return updateStopSettingsDraft(
      data.nanoId,
      {
        coordinates: data.coordinates,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )
  })
