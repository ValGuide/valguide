import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { guide, guideSettingsDraft } from '../../schema'

export type GuideSettingsDraftResult = {
  id: string
  guideId: string
  themeId: string | null
  settingsJson: string | null
  updatedAt: Date
}

export async function getGuideSettingsDraft(guideNanoId: string): Promise<GuideSettingsDraftResult> {
  const [foundGuide] = await db.select({ id: guide.id }).from(guide).where(eq(guide.nanoId, guideNanoId)).limit(1)

  if (!foundGuide) {
    throw new NotFoundError('Guide')
  }

  const [draft] = await db
    .select({
      id: guideSettingsDraft.id,
      guideId: guideSettingsDraft.guideId,
      themeId: guideSettingsDraft.themeId,
      settingsJson: guideSettingsDraft.settingsJson,
      updatedAt: guideSettingsDraft.updatedAt,
    })
    .from(guideSettingsDraft)
    .where(eq(guideSettingsDraft.guideId, foundGuide.id))
    .limit(1)

  if (!draft) {
    throw new NotFoundError('Guide settings draft')
  }

  return draft
}
