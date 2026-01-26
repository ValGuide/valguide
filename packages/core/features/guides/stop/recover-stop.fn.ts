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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const recoverStopSchema = z.object({
  nanoId: z.string(),
})

export const recoverStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return recoverStop(stopId, context.user.id)
  })
