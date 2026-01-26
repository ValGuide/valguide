import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft, guideLocaleVersion } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishGuideLocaleResult = {
  versionId: string
  version: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function publishGuideLocale(
  guideNanoId: string,
  locale: string,
  userId: string,
): Promise<PublishGuideLocaleResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  return db.transaction(async (tx) => {
    // 1. Lock locale row
    const [localeRow] = await tx
      .select({
        id: guideLocale.id,
        draftId: guideLocale.draftId,
      })
      .from(guideLocale)
      .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
      .for('update')

    if (!localeRow) {
      throw new NotFoundError('Guide locale')
    }

    // 2. Get draft content
    const [draft] = await tx
      .select({
        title: guideLocaleDraft.title,
        description: guideLocaleDraft.description,
        revision: guideLocaleDraft.revision,
      })
      .from(guideLocaleDraft)
      .where(eq(guideLocaleDraft.id, localeRow.draftId))

    if (!draft) {
      throw new NotFoundError('Guide locale draft')
    }

    // 3. Get next version number
    const [{ max }] = await tx
      .select({ max: sql<number>`COALESCE(MAX(${guideLocaleVersion.version}), 0)` })
      .from(guideLocaleVersion)
      .where(eq(guideLocaleVersion.guideLocaleId, localeRow.id))

    const nextVersion = max + 1

    // 4. Create immutable snapshot
    const [version] = await tx
      .insert(guideLocaleVersion)
      .values({
        guideLocaleId: localeRow.id,
        version: nextVersion,
        title: draft.title,
        description: draft.description,
        createdBy: userId,
        publishedAt: new Date(),
      })
      .returning({ id: guideLocaleVersion.id, version: guideLocaleVersion.version })

    // 5. Update pointer
    await tx
      .update(guideLocale)
      .set({
        publishedVersionId: version.id,
        lastPublishedDraftRevision: draft.revision,
      })
      .where(eq(guideLocale.id, localeRow.id))

    return { versionId: version.id, version: version.version }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const publishGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideLocale(data.nanoId, data.locale, context.user.id)
  })
