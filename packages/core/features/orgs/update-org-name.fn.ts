import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { updateOrgName } from './update-org-name.server'

const updateOrgNameSchema = z.object({
  organizationId: z.string(),
  newName: z.string().min(1).max(255),
})

export const updateOrgNameFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateOrgNameSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    await updateOrgName(db, data.organizationId, data.newName)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.name_updated',
      properties: {
        organization_id: data.organizationId,
        name_length: data.newName.length,
      },
    })
  })
