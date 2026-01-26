import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleDraft, stopLocaleVersion } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishStopLocaleResult = {
  versionId: string
  version: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function publishStopLocale(
  stopNanoId: string,
  locale: string,
  userId: string,
): Promise<PublishStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // 1. Lock locale row
    const [localeRow] = await tx
      .select({
        id: stopLocale.id,
        draftId: stopLocale.draftId,
      })
      .from(stopLocale)
      .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
      .for('update')

    if (!localeRow) {
      throw new NotFoundError('Stop locale')
    }

    // 2. Get draft content
    const [draft] = await tx
      .select({
        title: stopLocaleDraft.title,
        description: stopLocaleDraft.description,
        transcription: stopLocaleDraft.transcription,
        revision: stopLocaleDraft.revision,
      })
      .from(stopLocaleDraft)
      .where(eq(stopLocaleDraft.id, localeRow.draftId))

    if (!draft) {
      throw new NotFoundError('Stop locale draft')
    }

    // 3. Get next version number
    const [{ max }] = await tx
      .select({ max: sql<number>`COALESCE(MAX(${stopLocaleVersion.version}), 0)` })
      .from(stopLocaleVersion)
      .where(eq(stopLocaleVersion.stopLocaleId, localeRow.id))

    const nextVersion = max + 1

    // 4. Create immutable snapshot
    const [version] = await tx
      .insert(stopLocaleVersion)
      .values({
        stopLocaleId: localeRow.id,
        version: nextVersion,
        title: draft.title,
        description: draft.description,
        transcription: draft.transcription,
        createdBy: userId,
        publishedAt: new Date(),
      })
      .returning({ id: stopLocaleVersion.id, version: stopLocaleVersion.version })

    // 5. Update pointer
    await tx
      .update(stopLocale)
      .set({
        publishedVersionId: version.id,
        lastPublishedDraftRevision: draft.revision,
      })
      .where(eq(stopLocale.id, localeRow.id))

    return { versionId: version.id, version: version.version }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const publishStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return publishStopLocale(data.nanoId, data.locale, context.user.id)
  })
