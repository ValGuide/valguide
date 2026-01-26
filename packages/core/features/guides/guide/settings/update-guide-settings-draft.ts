import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { db } from '../../../db'
import { guide, guideSettingsDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateGuideSettingsDraftInput = {
  themeId?: string | null
  settingsJson?: string | null
}

export type UpdateGuideSettingsDraftResult = {
  id: string
  updatedAt: Date
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateGuideSettingsDraft(
  guideNanoId: string,
  input: UpdateGuideSettingsDraftInput,
  userId: string,
): Promise<UpdateGuideSettingsDraftResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [updated] = await db
    .update(guideSettingsDraft)
    .set({
      themeId: input.themeId,
      settingsJson: input.settingsJson,
      updatedBy: userId,
    })
    .where(eq(guideSettingsDraft.guideId, foundGuide.id))
    .returning({
      id: guideSettingsDraft.id,
      updatedAt: guideSettingsDraft.updatedAt,
    })

  if (!updated) {
    throw new NotFoundError('Guide settings draft')
  }

  return updated
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateGuideSettingsDraftSchema = z.object({
  nanoId: z.string(),
  themeId: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
})

export const updateGuideSettingsDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideSettingsDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return updateGuideSettingsDraft(
      data.nanoId,
      {
        themeId: data.themeId,
        settingsJson: data.settingsJson,
      },
      context.user.id,
    )
  })
