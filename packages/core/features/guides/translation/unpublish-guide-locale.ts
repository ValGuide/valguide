import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideLocale } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UnpublishGuideLocaleResult = {
  success: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function unpublishGuideLocale(guideNanoId: string, locale: string): Promise<UnpublishGuideLocaleResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const result = await db
    .update(guideLocale)
    .set({
      publishedVersionId: null,
      lastPublishedDraftRevision: null,
    })
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .returning({ id: guideLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Guide locale')
  }

  return { success: true }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const unpublishGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const unpublishGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return unpublishGuideLocale(data.nanoId, data.locale)
  })
