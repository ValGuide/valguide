import { and, eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateGuideLocaleDraftInput = {
  title?: string | null
  description?: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateGuideLocaleDraft(
  guideNanoId: string,
  locale: string,
  input: UpdateGuideLocaleDraftInput,
  userId: string,
): Promise<void> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const updateData: Record<string, unknown> = {
    updatedBy: userId,
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description

  const result = await db
    .update(guideLocaleDraft)
    .set(updateData)
    .where(and(eq(guideLocaleDraft.guideId, foundGuide.id), eq(guideLocaleDraft.locale, locale)))
    .returning({ id: guideLocaleDraft.id })

  if (result.length === 0) {
    throw new NotFoundError('Guide locale draft')
  }
}
