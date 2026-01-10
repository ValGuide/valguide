import { eq } from 'drizzle-orm'
import { db } from '@valguide/core/features/db'
import { theme as themeTable } from './schema'

export async function getFullThemeById(themeId: string) {
  const [row] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)
  return row ?? null
}

export async function getOrgThemes(organizationId: string) {
  return db.select().from(themeTable).where(eq(themeTable.organizationId, organizationId)).orderBy(themeTable.name)
}
