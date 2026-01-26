import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { deleteTheme } from './delete-theme.server'

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
