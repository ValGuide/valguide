import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopLocaleDraftInput = {
  title?: string | null
  description?: string | null
  transcription?: string | null
}

export type UpdateStopLocaleDraftResult = {
  success: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateStopLocaleDraft(
  stopNanoId: string,
  locale: string,
  input: UpdateStopLocaleDraftInput,
  userId: string,
): Promise<UpdateStopLocaleDraftResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  // Check if draft exists
  const [draftRow] = await db
    .select({ id: stopLocaleDraft.id })
    .from(stopLocaleDraft)
    .where(and(eq(stopLocaleDraft.stopId, foundStop.id), eq(stopLocaleDraft.locale, locale)))
    .limit(1)

  if (!draftRow) {
    throw new NotFoundError('Stop locale draft')
  }

  const updateData: Record<string, unknown> = {
    updatedBy: userId,
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.transcription !== undefined) updateData.transcription = input.transcription

  await db
    .update(stopLocaleDraft)
    .set(updateData)
    .where(and(eq(stopLocaleDraft.stopId, foundStop.id), eq(stopLocaleDraft.locale, locale)))

  return { success: true }
}
