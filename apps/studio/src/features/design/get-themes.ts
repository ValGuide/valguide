import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { getOrgThemes } from '@valguide/core/features/themes/get-org-themes'
import { z } from 'zod'

// =============================================================================
// TYPES
// =============================================================================

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getThemesInputSchema = z.object({})

export const getThemesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getThemesInputSchema)
  .handler(async ({ context }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    return getOrgThemes(organizationId)
  })
