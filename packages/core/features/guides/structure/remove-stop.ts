import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RemoveStopFromGuideInput = {
  guideNanoId: string
  stopNanoId: string
}

export type RemoveStopFromGuideResult = {
  removed: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function removeStopFromGuide(input: RemoveStopFromGuideInput): Promise<RemoveStopFromGuideResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, input.guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, input.stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // Get position of stop being removed
    const [existing] = await tx
      .select({ position: guideStopDraft.position })
      .from(guideStopDraft)
      .where(and(eq(guideStopDraft.guideId, foundGuide.id), eq(guideStopDraft.stopId, foundStop.id)))
      .limit(1)

    if (!existing) {
      return { removed: false }
    }

    // Delete the stop from draft
    await tx
      .delete(guideStopDraft)
      .where(and(eq(guideStopDraft.guideId, foundGuide.id), eq(guideStopDraft.stopId, foundStop.id)))

    // Shift positions down for stops after the removed one
    await tx
      .update(guideStopDraft)
      .set({ position: sql`${guideStopDraft.position} - 1` })
      .where(and(eq(guideStopDraft.guideId, foundGuide.id), sql`${guideStopDraft.position} > ${existing.position}`))

    return { removed: true }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const removeStopFromGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
})

export const removeStopFromGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopFromGuideSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)

    return removeStopFromGuide(data)
  })
