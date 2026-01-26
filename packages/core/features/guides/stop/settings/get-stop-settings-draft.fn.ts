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

export type StopSettingsDraftResult = {
  id: string
  stopId: string
  coordinates: string | null
  settingsJson: string | null
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStopSettingsDraft(stopNanoId: string): Promise<StopSettingsDraftResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [draft] = await db
    .select({
      id: stopSettingsDraft.id,
      stopId: stopSettingsDraft.stopId,
      coordinates: stopSettingsDraft.coordinates,
      settingsJson: stopSettingsDraft.settingsJson,
      updatedAt: stopSettingsDraft.updatedAt,
    })
    .from(stopSettingsDraft)
    .where(eq(stopSettingsDraft.stopId, foundStop.id))
    .limit(1)

  if (!draft) {
    throw new NotFoundError('Stop settings draft')
  }

  return draft
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getStopSettingsDraftSchema = z.object({
  nanoId: z.string(),
})

export const getStopSettingsDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return getStopSettingsDraft(data.nanoId)
  })
