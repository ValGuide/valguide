import { createServerFn } from '@tanstack/react-start'
import { requireSuperadminMiddleware } from '../admin/middleware'
import { addApprovedDomain, addApprovedDomainInputSchema } from './add-approved-domain.server'

export const addApprovedDomainFn = createServerFn({ method: 'POST' })
  .middleware([requireSuperadminMiddleware])
  .inputValidator(addApprovedDomainInputSchema)
  .handler(async ({ data }) => {
    return addApprovedDomain(data)
  })
