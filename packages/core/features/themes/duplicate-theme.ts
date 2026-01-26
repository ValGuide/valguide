import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { type CreateThemeInput, createTheme } from './create-theme'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function duplicateTheme(themeId: string, newName: string, createdBy?: string): Promise<Theme> {
  const [original] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)

  if (!original) {
    throw new Error('Theme not found')
  }

  const input: CreateThemeInput = {
    organizationId: original.organizationId,
    name: newName,
    basePreset: original.basePreset,
    colors: original.colors,
    radius: Number(original.radius),
    fonts: original.fonts,
    createdBy,
  }

  return createTheme(input)
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const duplicateThemeSchema = z.object({
  themeId: z.string(),
  newName: z.string().min(1),
})

export const duplicateThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(duplicateThemeSchema)
  .handler(async ({ context, data }) => {
    await requireThemeAccess(data.themeId, context.user.id)
    return duplicateTheme(data.themeId, data.newName, context.user.id)
  })
