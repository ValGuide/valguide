import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { updateOrgLogo } from './update-org-logo.server'

const updateOrgLogoSchema = z.object({
  organizationId: z.string(),
  storagePath: z.string().min(1),
})

export const updateOrgLogoFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateOrgLogoSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)

    if (!/^orgs\/[^/]+\/logos\//.test(data.storagePath)) {
      throw new Error('Invalid storage path')
    }

    await updateOrgLogo(db, data.organizationId, data.storagePath)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.logo_updated',
      properties: {
        organization_id: data.organizationId,
      },
    })
    return { storagePath: data.storagePath }
  })
