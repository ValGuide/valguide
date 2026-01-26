import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  revision: number
  hasUnpublishedChanges: boolean
  publishedVersionId: string | null
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getGuideLocaleDraft(guideNanoId: string, locale: string): Promise<GuideLocaleDraftResult | null> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) return null

  const [row] = await db
    .select({
      locale: guideLocale.locale,
      title: guideLocaleDraft.title,
      description: guideLocaleDraft.description,
      revision: guideLocaleDraft.revision,
      publishedVersionId: guideLocale.publishedVersionId,
      lastPublishedDraftRevision: guideLocale.lastPublishedDraftRevision,
    })
    .from(guideLocale)
    .innerJoin(guideLocaleDraft, eq(guideLocaleDraft.id, guideLocale.draftId))
    .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
    .limit(1)

  if (!row) return null

  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    revision: row.revision,
    hasUnpublishedChanges: row.publishedVersionId === null || row.revision !== row.lastPublishedDraftRevision,
    publishedVersionId: row.publishedVersionId,
  }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getGuideLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getGuideLocaleDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const draft = await getGuideLocaleDraft(data.nanoId, data.locale)
    if (!draft) {
      throw new NotFoundError('Guide locale')
    }

    return draft
  })
