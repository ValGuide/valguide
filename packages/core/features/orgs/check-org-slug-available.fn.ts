import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import { checkOrgSlugAvailable } from './check-org-slug-available.server'

export type { SlugAvailabilityResult } from './check-org-slug-available.server'

const checkOrgSlugAvailableSchema = z.object({
  slug: z.string(),
  excludeOrgId: z.string().optional(),
})

export const checkOrgSlugAvailableFn = createServerFn({ method: 'GET' })
  .inputValidator(checkOrgSlugAvailableSchema)
  .handler(async ({ data }) => {
    return checkOrgSlugAvailable(db, data.slug, data.excludeOrgId)
  })
