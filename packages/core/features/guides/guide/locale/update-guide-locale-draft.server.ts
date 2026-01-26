import { and, eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateGuideLocaleDraftInput = {
  title?: string | null
  description?: string | null
}

export type UpdateGuideLocaleDraftResult = {
  revision: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateGuideLocaleDraft(
  guideNanoId: string,
  locale: string,
  input: UpdateGuideLocaleDraftInput,
  userId: string,
): Promise<UpdateGuideLocaleDraftResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [localeRow] = await db
    .select({ id: guideLocale.id })
    .from(guideLocale)
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .limit(1)

  if (!localeRow) {
    throw new NotFoundError('Guide locale')
  }

  const updateData: Record<string, unknown> = {
    updatedBy: userId,
    revision: sql`${guideLocaleDraft.revision} + 1`,
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description

  const [updated] = await db
    .update(guideLocaleDraft)
    .set(updateData)
    .where(eq(guideLocaleDraft.guideLocaleId, localeRow.id))
    .returning({ revision: guideLocaleDraft.revision })

  return { revision: updated.revision }
}
