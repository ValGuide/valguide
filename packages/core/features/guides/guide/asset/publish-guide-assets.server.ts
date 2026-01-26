import { and, eq, isNull, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideAsset } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishGuideAssetsInput = {
  channel: string
  locale?: string | null
}

export type PublishGuideAssetsResult = {
  published: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function publishGuideAssets(
  guideNanoId: string,
  input: PublishGuideAssetsInput,
): Promise<PublishGuideAssetsResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const locale = input.locale ?? null

  return db.transaction(async (tx) => {
    // 1. Lock guide row
    await tx.select({ id: guide.id }).from(guide).where(eq(guide.id, foundGuide.id)).for('update')

    // 2. Delete live assets for this channel+locale
    const localeCondition = locale === null ? isNull(guideAsset.locale) : eq(guideAsset.locale, locale)

    await tx
      .delete(guideAsset)
      .where(and(eq(guideAsset.guideId, foundGuide.id), eq(guideAsset.channel, input.channel), localeCondition))

    // 3. Copy draft → live
    const result = await tx.execute<{ count: number }>(sql`
			WITH inserted AS (
				INSERT INTO studio.guide_asset (id, guide_id, asset_id, channel, locale, position, published_at)
				SELECT gen_random_uuid(), guide_id, asset_id, channel, locale, position, NOW()
				FROM studio.guide_asset_draft
				WHERE guide_id = ${foundGuide.id}
					AND channel = ${input.channel}
					AND ${locale === null ? sql`locale IS NULL` : sql`locale = ${locale}`}
				RETURNING 1
			)
			SELECT COUNT(*)::int AS count FROM inserted
		`)

    return { published: result[0]?.count ?? 0 }
  })
}
