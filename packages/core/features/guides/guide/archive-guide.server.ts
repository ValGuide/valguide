import { eq } from 'drizzle-orm'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
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
