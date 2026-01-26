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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateStopSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
})

export const updateStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return updateStop(stopId, { availableLocales: data.availableLocales }, context.user.id)
  })
