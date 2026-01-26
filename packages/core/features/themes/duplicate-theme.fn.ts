import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { duplicateTheme } from './duplicate-theme.server'

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
