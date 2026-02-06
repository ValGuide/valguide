import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { getOrgSlugs } from './get-org-slugs.server'

export type { OrgSlugRecord } from './get-org-slugs.server'

const getOrgSlugsSchema = z.object({
  organizationId: z.string(),
})

export const getOrgSlugsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getOrgSlugsSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    return getOrgSlugs(db, data.organizationId)
  })
