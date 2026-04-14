import { createServerFn } from '@tanstack/react-start'
import { captureStudioProductEvent } from '../../../posthog/server'
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
    const result = await updateOrganizationQrBrandingSettings(organizationId, context.user.id, data)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'qr.organization_branding_updated',
      properties: {
        qr_action: Object.keys(data).length === 0 ? 'reset' : 'update',
        style_preset: data.stylePreset ?? null,
      },
    })
    return result
  })
