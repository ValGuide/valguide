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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const archiveStopSchema = z.object({
  nanoId: z.string(),
})

export const archiveStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return archiveStop(stopId, context.user.id)
  })
