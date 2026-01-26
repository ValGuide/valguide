import { eq } from 'drizzle-orm'
import { db } from '../db'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getOrgThemes(organizationId: string): Promise<Theme[]> {
  return db.select().from(themeTable).where(eq(themeTable.organizationId, organizationId)).orderBy(themeTable.name)
}
