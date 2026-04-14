import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireAuthMiddleware } from '../auth/middleware'
import { updateProfile } from './update-profile.server'

export type { UpdateProfileInput, UpdateProfileResult } from './update-profile.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateProfileSchema = z.object({
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_onboarded: z.boolean().optional(),
})

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(async ({ context, data }) => {
    const result = await updateProfile(context.user.id, data)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'profile.updated',
      properties: {
        updated_fields: Object.keys(data),
      },
    })
    return result
  })
