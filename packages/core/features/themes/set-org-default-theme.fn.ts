import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { setOrgDefaultTheme } from './set-org-default-theme.server'

export type { Organization } from './set-org-default-theme.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const setOrgDefaultThemeSchema = z.object({
  organizationId: z.string(),
  themeId: z.string().nullable(),
})

export const setOrgDefaultThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(setOrgDefaultThemeSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    return setOrgDefaultTheme(data.organizationId, data.themeId)
  })
