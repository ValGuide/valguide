import { createServerFn } from '@tanstack/react-start'
import { ForbiddenError, requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateOrganizationQrBrandingSettings } from './qr-branding.server'
import { qrBrandingOverrideSchema } from './shared'

export type { OrganizationQrBrandingSettings } from './qr-branding.server'

export const updateOrgQrBrandingFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(qrBrandingOverrideSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new ForbiddenError('No active organization selected')
    }

    await requireOrgMember(organizationId, context.user.id)
    return updateOrganizationQrBrandingSettings(organizationId, context.user.id, data)
  })
