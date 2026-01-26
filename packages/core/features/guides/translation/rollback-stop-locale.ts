import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { ForbiddenError, NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { stop, stopLocale, stopLocaleVersion } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RollbackStopLocaleResult = {
  versionId: string
  version: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function rollbackStopLocale(
  stopNanoId: string,
  locale: string,
  targetVersionId: string,
): Promise<RollbackStopLocaleResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // 1. Get locale row
    const [localeRow] = await tx
      .select({ id: stopLocale.id })
      .from(stopLocale)
      .where(and(eq(stopLocale.stopId, foundStop.id), eq(stopLocale.locale, locale)))
      .for('update')

    if (!localeRow) {
      throw new NotFoundError('Stop locale')
    }

    // 2. Verify target version belongs to this locale
    const [targetVersion] = await tx
      .select({
        id: stopLocaleVersion.id,
        version: stopLocaleVersion.version,
      })
      .from(stopLocaleVersion)
      .where(and(eq(stopLocaleVersion.id, targetVersionId), eq(stopLocaleVersion.stopLocaleId, localeRow.id)))
      .limit(1)

    if (!targetVersion) {
      throw new ForbiddenError('Target version does not belong to this locale')
    }

    // 3. Update pointer to target version
    await tx
      .update(stopLocale)
      .set({
        publishedVersionId: targetVersion.id,
      })
      .where(eq(stopLocale.id, localeRow.id))

    return { versionId: targetVersion.id, version: targetVersion.version }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const rollbackStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  targetVersionId: z.string(),
})

export const rollbackStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return rollbackStopLocale(data.nanoId, data.locale, data.targetVersionId)
  })
