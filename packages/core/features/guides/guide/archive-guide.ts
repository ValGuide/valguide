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

export type ArchiveGuideResult = {
  nanoId: string
  archivedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function archiveGuide(nanoId: string, userId: string): Promise<ArchiveGuideResult> {
  const { guideId } = await requireGuideAccessByNanoId(nanoId, userId)

  const now = new Date()

  const [updated] = await db
    .update(guide)
    .set({
      archivedAt: now,
      updatedBy: userId,
    })
    .where(eq(guide.id, guideId))
    .returning({ nanoId: guide.nanoId, archivedAt: guide.archivedAt })

  if (!updated || !updated.archivedAt) {
    throw new NotFoundError('Guide')
  }

  return {
    nanoId: updated.nanoId,
    archivedAt: updated.archivedAt,
  }
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const archiveGuideSchema = z.object({
  nanoId: z.string(),
})

export const archiveGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveGuideSchema)
  .handler(async ({ context, data }) => {
    return archiveGuide(data.nanoId, context.user.id)
  })
