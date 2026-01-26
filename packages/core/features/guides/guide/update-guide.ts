import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateGuideInput = {
  nanoId: string
  availableLocales?: string[]
  addLocale?: string
  removeLocale?: string
}

export type UpdateGuideResult = {
  nanoId: string
  availableLocales: string[]
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateGuide(input: UpdateGuideInput, userId: string): Promise<UpdateGuideResult> {
  const { guideId } = await requireGuideAccessByNanoId(input.nanoId, userId)

  return db.transaction(async (tx) => {
    const updateData: Partial<{ availableLocales: string[]; updatedBy: string }> = {
      updatedBy: userId,
    }

    if (input.availableLocales) {
      updateData.availableLocales = input.availableLocales
    }

    if (input.addLocale) {
      const [current] = await tx
        .select({ availableLocales: guide.availableLocales })
        .from(guide)
        .where(eq(guide.id, guideId))
        .limit(1)

      const locales = current?.availableLocales ?? []
      if (!locales.includes(input.addLocale)) {
        updateData.availableLocales = [...locales, input.addLocale]
      }
    }

    if (input.removeLocale) {
      const [current] = await tx
        .select({ availableLocales: guide.availableLocales })
        .from(guide)
        .where(eq(guide.id, guideId))
        .limit(1)

      const locales = current?.availableLocales ?? []
      updateData.availableLocales = locales.filter((l) => l !== input.removeLocale)
    }

    const [updated] = await tx
      .update(guide)
      .set(updateData)
      .where(eq(guide.id, guideId))
      .returning({ nanoId: guide.nanoId, availableLocales: guide.availableLocales })

    if (!updated) {
      throw new NotFoundError('Guide')
    }

    return {
      nanoId: updated.nanoId,
      availableLocales: updated.availableLocales ?? [],
    }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateGuideSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
  addLocale: z.string().optional(),
  removeLocale: z.string().optional(),
})

export const updateGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideSchema)
  .handler(async ({ context, data }) => {
    return updateGuide(data, context.user.id)
  })
