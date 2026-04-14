import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgRole } from '../auth/authorization'
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
    await requireOrgRole(data.organizationId, context.user.id, 'admin')
    const result = await setOrgDefaultTheme(data.organizationId, data.themeId)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: data.themeId ? 'theme.default_set' : 'theme.default_cleared',
      properties: {
        organization_id: data.organizationId,
        theme_id: data.themeId,
      },
    })
    return result
  })
