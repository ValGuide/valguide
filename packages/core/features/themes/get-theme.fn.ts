import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getThemeById } from './get-theme.server'

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
