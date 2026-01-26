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

export async function getThemeById(themeId: string): Promise<Theme | null> {
  const [row] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)
  return row ?? null
}
