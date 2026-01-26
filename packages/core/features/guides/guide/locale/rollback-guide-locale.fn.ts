import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { ForbiddenError, NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { guide, guideLocale, guideLocaleVersion } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RollbackGuideLocaleResult = {
  versionId: string
  version: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function rollbackGuideLocale(
  guideNanoId: string,
  locale: string,
  targetVersionId: string,
): Promise<RollbackGuideLocaleResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  return db.transaction(async (tx) => {
    // 1. Get locale row
    const [localeRow] = await tx
      .select({ id: guideLocale.id })
      .from(guideLocale)
      .where(and(eq(guideLocale.guideId, foundGuide.id), eq(guideLocale.locale, locale)))
      .for('update')

    if (!localeRow) {
      throw new NotFoundError('Guide locale')
    }

    // 2. Verify target version belongs to this locale
    const [targetVersion] = await tx
      .select({
        id: guideLocaleVersion.id,
        version: guideLocaleVersion.version,
      })
      .from(guideLocaleVersion)
      .where(and(eq(guideLocaleVersion.id, targetVersionId), eq(guideLocaleVersion.guideLocaleId, localeRow.id)))
      .limit(1)

    if (!targetVersion) {
      throw new ForbiddenError('Target version does not belong to this locale')
    }

    // 3. Update pointer to target version
    await tx
      .update(guideLocale)
      .set({
        publishedVersionId: targetVersion.id,
      })
      .where(eq(guideLocale.id, localeRow.id))

    return { versionId: targetVersion.id, version: targetVersion.version }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const rollbackGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  targetVersionId: z.string(),
})

export const rollbackGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return rollbackGuideLocale(data.nanoId, data.locale, data.targetVersionId)
  })
