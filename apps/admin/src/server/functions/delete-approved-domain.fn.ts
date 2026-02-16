import { createServerFn } from '@tanstack/react-start'
import { deleteApprovedDomain } from '@valguide/core/features/orgs/delete-approved-domain.server'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'

export const deleteApprovedDomainFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ domainId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await deleteApprovedDomain(data.domainId)
  })
