import { createServerFn } from '@tanstack/react-start'
import { requireSuperadminMiddleware } from '../admin/middleware'
import { getApprovedDomains } from './get-approved-domains.server'

export type { ApprovedDomain } from './get-approved-domains.server'

export const getApprovedDomainsFn = createServerFn({ method: 'GET' })
  .middleware([requireSuperadminMiddleware])
  .handler(async () => {
    return getApprovedDomains()
  })
