import { eq } from 'drizzle-orm'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { db } from '../../db'
import { guide } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type RecoverGuideResult = {
  nanoId: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function recoverGuide(nanoId: string, userId: string): Promise<RecoverGuideResult> {
  const { guideId } = await requireGuideAccessByNanoId(nanoId, userId)

  const [updated] = await db
    .update(guide)
    .set({
      archivedAt: null,
      updatedBy: userId,
    })
    .where(eq(guide.id, guideId))
    .returning({ nanoId: guide.nanoId })

  if (!updated) {
    throw new NotFoundError('Guide')
  }

  return { nanoId: updated.nanoId }
}
