import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ForbiddenError, requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getOrganizationQrBrandingSettings } from './qr-branding.server'

export type { OrganizationQrBrandingSettings } from './qr-branding.server'

export const getOrgQrBrandingFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new ForbiddenError('No active organization selected')
    }

    await requireOrgMember(organizationId, context.user.id)
    return getOrganizationQrBrandingSettings(organizationId)
  })
