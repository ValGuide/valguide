import { and, eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopLocale, stopLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateStopLocaleDraftInput = {
  title?: string | null
  description?: string | null
  transcription?: string | null
}

export type UpdateStopLocaleDraftResult = {
  revision: number
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

  const [localeRow] = await db
    .select({ draftId: stopLocale.draftId })
    .from(stopLocale)
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .limit(1)

  if (!localeRow) {
    throw new NotFoundError('Stop locale')
  }

  const updateData: Record<string, unknown> = {
    updatedBy: userId,
    revision: sql`${stopLocaleDraft.revision} + 1`,
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.transcription !== undefined) updateData.transcription = input.transcription

  const [updated] = await db
    .update(stopLocaleDraft)
    .set(updateData)
    .where(eq(stopLocaleDraft.id, localeRow.draftId))
    .returning({ revision: stopLocaleDraft.revision })

  return { revision: updated.revision }
}
