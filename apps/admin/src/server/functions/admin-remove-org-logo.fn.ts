import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminRemoveOrgLogo } from './admin-remove-org-logo.server'

export const adminRemoveOrgLogoFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ orgNanoId: z.string() }))
  .handler(async ({ data }) => {
    await adminRemoveOrgLogo(db, data.orgNanoId)
  })
