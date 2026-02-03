import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { tour, tourSettingsDraft } from '../tours/schema'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type TourSettingsDraft = typeof tourSettingsDraft.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function setTourTheme(tourId: string, themeId: string | null): Promise<TourSettingsDraft> {
  if (themeId) {
    const [t] = await db
      .select({ organizationId: tour.organizationId })
      .from(tour)
      .where(eq(tour.id, tourId))
      .limit(1)

    if (!t) {
      throw new Error('Tour not found')
    }

    const [row] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.organizationId, t.organizationId)))
      .limit(1)

    if (!row) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  // Update themeId in tour settings draft
  const [updatedSettings] = await db
    .update(tourSettingsDraft)
    .set({ themeId })
    .where(eq(tourSettingsDraft.tourId, tourId))
    .returning()

  return updatedSettings
}
