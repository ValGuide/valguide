import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const deleteStopSchema = z.object({
  nanoId: z.string(),
})

export const deleteStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return deleteStop(stopId, context.user.id)
  })
