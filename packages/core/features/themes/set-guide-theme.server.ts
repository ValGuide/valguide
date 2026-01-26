import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { guide, guideSettingsDraft } from '../guides/schema'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type GuideSettingsDraft = typeof guideSettingsDraft.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function setGuideTheme(guideId: string, themeId: string | null): Promise<GuideSettingsDraft> {
  if (themeId) {
    const [g] = await db
      .select({ organizationId: guide.organizationId })
      .from(guide)
      .where(eq(guide.id, guideId))
      .limit(1)

    if (!g) {
      throw new Error('Guide not found')
    }

    const [row] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.organizationId, g.organizationId)))
      .limit(1)

    if (!row) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  // Update themeId in guide settings draft
  const [updatedSettings] = await db
    .update(guideSettingsDraft)
    .set({ themeId })
    .where(eq(guideSettingsDraft.guideId, guideId))
    .returning()

  return updatedSettings
}
