import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { createTour } from './create-tour.server'
import { notifyTourCreated } from './notify-tour-created.server'

export type { CreateTourInput, CreateTourResult } from './create-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createTourSchema = z.object({
  nanoId: z.string().optional(),
  title: z.string().optional(),
  locale: z.string().optional(),
})

export const createTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTourSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    const result = await createTour(data, orgId, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.created',
      properties: {
        tour_nano_id: result.nanoId,
        locale: result.locale,
      },
    })

    await notifyTourCreated({
      actorEmail: context.user.email ?? null,
      locale: result.locale,
      organizationId: orgId,
      tourNanoId: result.nanoId,
    }).catch((error) => {
      console.error('Failed to send tour created notification to Slack:', error)
    })

    return result
  })
