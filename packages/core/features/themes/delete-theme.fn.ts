import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { guideSettingsDraft } from '../guides/schema'
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

  // Clear themeId from guide settings drafts
  await db.update(guideSettingsDraft).set({ themeId: null }).where(eq(guideSettingsDraft.themeId, themeId))

  const [deleted] = await db.delete(themeTable).where(eq(themeTable.id, themeId)).returning()

  return deleted
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const deleteThemeSchema = z.object({
  id: z.string(),
})

export const deleteThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteThemeSchema)
  .handler(async ({ context, data }) => {
    await requireThemeAccess(data.id, context.user.id)
    await deleteTheme(data.id)
    return { success: true }
  })
