import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { getOrgMembers } from './get-org-members.server'

export type { AdminOrgMember } from './get-org-members.server'

export const adminGetOrgMembersFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ nanoId: z.string() }))
  .handler(async ({ data }) => {
    return getOrgMembers(db, data.nanoId)
  })
