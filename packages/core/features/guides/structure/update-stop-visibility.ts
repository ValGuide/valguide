import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideStopDraft, stop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopVisibilityInput = {
  guideNanoId: string
  stopNanoId: string
  visible: boolean
}

export type UpdateStopVisibilityResult = {
  guideNanoId: string
  stopNanoId: string
  visible: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateStopVisibility(input: UpdateStopVisibilityInput): Promise<UpdateStopVisibilityResult> {
  const { guideNanoId, stopNanoId, visible } = input

  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const [existing] = await db
    .select({ id: guideStopDraft.id })
    .from(guideStopDraft)
    .where(and(eq(guideStopDraft.guideId, foundGuide.id), eq(guideStopDraft.stopId, foundStop.id)))
    .limit(1)

  if (!existing) {
    throw new NotFoundError('Stop not found in guide')
  }

  await db
    .update(guideStopDraft)
    .set({ visible })
    .where(and(eq(guideStopDraft.guideId, foundGuide.id), eq(guideStopDraft.stopId, foundStop.id)))

  return { guideNanoId, stopNanoId, visible }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateStopVisibilitySchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  visible: z.boolean(),
})

export const updateStopVisibilityFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopVisibilitySchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    return updateStopVisibility(data)
  })
