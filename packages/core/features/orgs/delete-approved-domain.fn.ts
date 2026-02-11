import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSuperadminMiddleware } from '../admin/middleware'
import { deleteApprovedDomain } from './delete-approved-domain.server'

export const deleteApprovedDomainFn = createServerFn({ method: 'POST' })
  .middleware([requireSuperadminMiddleware])
  .inputValidator(z.object({ domainId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await deleteApprovedDomain(data.domainId)
  })
