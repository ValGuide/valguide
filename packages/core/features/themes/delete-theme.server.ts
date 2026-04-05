import { eq } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { tourSettings, tourSettingsDraft } from '../tours/schema'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteTheme(themeId: string): Promise<Theme> {
  return db.transaction(async (tx) => {
    await tx.update(organization).set({ defaultThemeId: null }).where(eq(organization.defaultThemeId, themeId))

    // Clear themeId from draft settings so editor state falls back immediately.
    await tx.update(tourSettingsDraft).set({ themeId: null }).where(eq(tourSettingsDraft.themeId, themeId))

    // Clear themeId from published settings so persisted live state matches runtime fallback behavior.
    await tx.update(tourSettings).set({ themeId: null }).where(eq(tourSettings.themeId, themeId))

    const [deleted] = await tx.delete(themeTable).where(eq(themeTable.id, themeId)).returning()

    return deleted
  })
}
