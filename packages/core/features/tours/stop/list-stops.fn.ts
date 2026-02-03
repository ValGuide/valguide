import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listStops } from './list-stops.server'

export type { ListStopsFilters, StopListItem } from './list-stops.server'

const listStopsSchema = z.object({
  includeArchived: z.boolean().optional(),
  locale: z.string().optional(),
})

export const listStopsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(listStopsSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return listStops(orgId, data)
  })
