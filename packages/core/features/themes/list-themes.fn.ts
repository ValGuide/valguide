import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrgThemes } from './get-org-themes.server'

// =============================================================================
// TYPES
// =============================================================================

export type { Theme } from './get-org-themes.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

/**
 * List themes for the active organization (from context)
 */
export const listThemesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return getOrgThemes(orgId)
  })
