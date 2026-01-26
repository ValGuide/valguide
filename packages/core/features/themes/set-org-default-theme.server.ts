import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Organization = typeof organization.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function setOrgDefaultTheme(organizationId: string, themeId: string | null): Promise<Organization> {
  if (themeId) {
    const [row] = await db
      .select()
      .from(themeTable)
      .where(and(eq(themeTable.id, themeId), eq(themeTable.organizationId, organizationId)))
      .limit(1)

    if (!row) {
      throw new Error('Theme not found or does not belong to this organization')
    }
  }

  const [org] = await db
    .update(organization)
    .set({ defaultThemeId: themeId })
    .where(eq(organization.id, organizationId))
    .returning()

  return org
}
