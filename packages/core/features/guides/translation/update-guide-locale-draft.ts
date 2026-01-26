import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft } from '../schema'

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
    .select({ draftId: guideLocale.draftId })
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
    .where(eq(guideLocaleDraft.id, localeRow.draftId))
    .returning({ revision: guideLocaleDraft.revision })

  return { revision: updated.revision }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateGuideLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const updateGuideLocaleDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const { nanoId, locale, ...input } = data
    return updateGuideLocaleDraft(nanoId, locale, input, context.user.id)
  })
