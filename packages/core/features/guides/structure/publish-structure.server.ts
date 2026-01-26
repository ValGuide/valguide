import { eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../auth/authorization'
import { db } from '../../db'
import { guide, guideStop } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishStructureResult = {
  published: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function publishGuideStructure(guideNanoId: string): Promise<PublishStructureResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  return db.transaction(async (tx) => {
    // 1. Lock guide row
    await tx.select({ id: guide.id }).from(guide).where(eq(guide.id, foundGuide.id)).for('update')

    // 2. Delete all live rows for this guide
    await tx.delete(guideStop).where(eq(guideStop.guideId, foundGuide.id))

    // 3. Copy draft → live
    const result = await tx.execute<{ count: number }>(sql`
			WITH inserted AS (
				INSERT INTO studio.guide_stop (id, guide_id, stop_id, position, visible, published_at)
				SELECT gen_random_uuid(), guide_id, stop_id, position, visible, NOW()
				FROM studio.guide_stop_draft
				WHERE guide_id = ${foundGuide.id}
				RETURNING 1
			)
			SELECT COUNT(*)::int AS count FROM inserted
		`)

    return { published: result[0]?.count ?? 0 }
  })
}
