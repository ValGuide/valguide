import { createServerFn } from '@tanstack/react-start'
import { getApprovedDomains } from '@valguide/core/features/auth/get-approved-domains.server'
import { adminMiddleware } from '../middleware'

export type { ApprovedDomain } from '@valguide/core/features/auth/get-approved-domains.server'

export const getApprovedDomainsFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return getApprovedDomains()
  })
