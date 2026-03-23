import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { timePerformance } from '../../../utils/performance'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listTours } from './list-tours.server'

export type { ListToursFilters, TourCoverImage, TourListItem } from './list-tours.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const listToursSchema = z.object({
  includeArchived: z.boolean().optional(),
  locale: z.string().optional(),
})

export const listToursFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(listToursSchema)
  .handler(async ({ context, data }) => {
    return timePerformance(
      'tours.listToursFn.total',
      async () => {
        const orgId = context.activeOrgId
        if (!orgId) {
          throw new Error('No active organization')
        }

        await timePerformance(
          'tours.listToursFn.requireOrgMember',
          async () => requireOrgMember(orgId, context.user.id),
          {
            userId: context.user.id,
            orgId,
          },
        )

        return timePerformance('tours.listToursFn.listTours', async () => listTours(orgId, data), {
          userId: context.user.id,
          orgId,
          locale: data.locale ?? 'en',
          includeArchived: data.includeArchived ?? false,
        })
      },
      { userId: context.user.id },
    )
  })
