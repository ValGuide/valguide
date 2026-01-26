import { createServerFn } from '@tanstack/react-start'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopBasic = {
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getStop(nanoId: string): Promise<StopBasic | null> {
  const [foundStop] = await db
    .select({
      nanoId: stop.nanoId,
      organizationId: stop.organizationId,
      availableLocales: stop.availableLocales,
      archivedAt: stop.archivedAt,
      createdAt: stop.createdAt,
      updatedAt: stop.updatedAt,
    })
    .from(stop)
    .where(and(eq(stop.nanoId, nanoId), isNull(stop.deletedAt)))
    .limit(1)

  return foundStop ?? null
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getStopSchema = z.object({
  nanoId: z.string(),
})

export const getStopFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const foundStop = await getStop(data.nanoId)
    if (!foundStop) {
      throw new NotFoundError('Stop')
    }

    return foundStop
  })
