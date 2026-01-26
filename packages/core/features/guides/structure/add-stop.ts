import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type AddStopToGuideInput = {
  guideNanoId: string
  stopNanoId: string
  position?: number
}

export type AddStopToGuideResult = {
  guideId: string
  stopId: string
  position: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function addStopToGuide(input: AddStopToGuideInput): Promise<AddStopToGuideResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, input.guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, input.stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // Get max position for this guide
    const [{ max }] = await tx
      .select({ max: sql<number>`COALESCE(MAX(${guideStopDraft.position}), -1)` })
      .from(guideStopDraft)
      .where(eq(guideStopDraft.guideId, foundGuide.id))

    const position = input.position ?? max + 1

    // If inserting at specific position, shift existing stops
    if (input.position !== undefined) {
      await tx
        .update(guideStopDraft)
        .set({ position: sql`${guideStopDraft.position} + 1` })
        .where(and(eq(guideStopDraft.guideId, foundGuide.id), sql`${guideStopDraft.position} >= ${position}`))
    }

    // Insert new stop
    await tx
      .insert(guideStopDraft)
      .values({
        guideId: foundGuide.id,
        stopId: foundStop.id,
        position,
        visible: true,
      })
      .onConflictDoNothing()

    return { guideId: foundGuide.id, stopId: foundStop.id, position }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const addStopToGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  position: z.number().int().min(0).optional(),
})

export const addStopToGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(addStopToGuideSchema)
  .handler(async ({ context, data }) => {
    // Verify access to both guide and stop
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    return addStopToGuide(data)
  })
