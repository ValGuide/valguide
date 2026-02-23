import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminUpdateOrgName } from './admin-update-org-name.server'

export const adminUpdateOrgNameFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      orgNanoId: z.string(),
      name: z.string().min(1).max(255),
    }),
  )
  .handler(async ({ data }) => {
    await adminUpdateOrgName(db, data)
  })
