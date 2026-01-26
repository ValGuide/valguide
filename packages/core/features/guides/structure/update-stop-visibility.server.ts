import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
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
