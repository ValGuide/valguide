import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import { resolveOrgByIdOrSlug } from './resolve-org.server'

export type { ResolvedOrg } from './resolve-org.server'

export const resolveOrgFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ idOrSlug: z.string() }))
  .handler(async ({ data }) => {
    return resolveOrgByIdOrSlug(db, data.idOrSlug)
  })
