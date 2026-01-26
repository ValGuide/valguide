import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getOrgThemesSchema = z.object({
  organizationId: z.string(),
})

export const getOrgThemesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getOrgThemesSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    return getOrgThemes(data.organizationId)
  })
