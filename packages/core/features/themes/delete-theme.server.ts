import { eq } from 'drizzle-orm'
import { db } from '../db'
import { tourSettingsDraft } from '../tours/schema'
import { organization } from '../orgs/schema'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteTheme(themeId: string): Promise<Theme> {
  await db.update(organization).set({ defaultThemeId: null }).where(eq(organization.defaultThemeId, themeId))

  // Clear themeId from tour settings drafts
  await db.update(tourSettingsDraft).set({ themeId: null }).where(eq(tourSettingsDraft.themeId, themeId))

  const [deleted] = await db.delete(themeTable).where(eq(themeTable.id, themeId)).returning()

  return deleted
}
