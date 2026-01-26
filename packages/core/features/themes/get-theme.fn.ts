import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
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

export async function getThemeById(themeId: string): Promise<Theme | null> {
  const [row] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)
  return row ?? null
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getThemeSchema = z.object({
  id: z.string(),
})

export const getThemeFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getThemeSchema)
  .handler(async ({ context, data }) => {
    await requireThemeAccess(data.id, context.user.id)
    return getThemeById(data.id)
  })
