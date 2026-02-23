import { createServerFn } from '@tanstack/react-start'
import {
  addApprovedDomain,
  addApprovedDomainInputSchema,
} from '@valguide/core/features/auth/add-approved-domain.server'
import { adminMiddleware } from '../middleware'

export const addApprovedDomainFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(addApprovedDomainInputSchema)
  .handler(async ({ data }) => {
    return addApprovedDomain(data)
  })
