import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrgThemes } from './get-org-themes.server'

export type { Theme } from './get-org-themes.server'

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
