import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../../../db'
import { resolveTourByIdOrSlug } from './resolve-tour.server'

export type { ResolvedTour } from './resolve-tour.server'

export const resolveTourFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ orgId: z.string(), idOrSlug: z.string() }))
  .handler(async ({ data }) => {
    return resolveTourByIdOrSlug(db, data.orgId, data.idOrSlug)
  })
