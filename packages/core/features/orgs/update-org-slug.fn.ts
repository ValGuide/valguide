import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { updateOrgSlug } from './update-org-slug.server'

export type { UpdateOrgSlugResult } from './update-org-slug.server'

const updateOrgSlugSchema = z.object({
  organizationId: z.string(),
  newSlug: z.string(),
})

export const updateOrgSlugFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateOrgSlugSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    return updateOrgSlug(db, data.organizationId, data.newSlug)
  })
