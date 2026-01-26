import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { stop, stopLocale } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UnpublishStopLocaleResult = {
  success: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function unpublishStopLocale(stopNanoId: string, locale: string): Promise<UnpublishStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const result = await db
    .update(stopLocale)
    .set({
      publishedVersionId: null,
      lastPublishedDraftRevision: null,
    })
    .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
    .returning({ id: stopLocale.id })

  if (result.length === 0) {
    throw new NotFoundError('Stop locale')
  }

  return { success: true }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const unpublishStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const unpublishStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return unpublishStopLocale(data.nanoId, data.locale)
  })
