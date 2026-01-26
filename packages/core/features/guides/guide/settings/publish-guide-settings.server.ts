import { eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideSettings } from '../../schema'

export type PublishGuideSettingsResult = {
  published: boolean
}

export async function publishGuideSettings(guideNanoId: string, userId: string): Promise<PublishGuideSettingsResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  return db.transaction(async (tx) => {
    // 1. Lock guide row
    await tx.select({ id: guide.id }).from(guide).where(eq(guide.id, foundGuide.id)).for('update')

    // 2. Delete existing live settings
    await tx.delete(guideSettings).where(eq(guideSettings.guideId, foundGuide.id))

    // 3. Copy draft → live
    await tx.execute(sql`
			INSERT INTO studio.guide_settings (id, guide_id, theme_id, settings_json, published_at, published_by)
			SELECT gen_random_uuid(), guide_id, theme_id, settings_json, NOW(), ${userId}
			FROM studio.guide_settings_draft
			WHERE guide_id = ${foundGuide.id}
		`)

    return { published: true }
  })
}
