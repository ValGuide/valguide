import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { guide, guideSettings } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishGuideSettingsResult = {
  published: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const publishGuideSettingsSchema = z.object({
  nanoId: z.string(),
})

export const publishGuideSettingsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideSettingsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideSettings(data.nanoId, context.user.id)
  })
