import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { updateProfile } from './update-profile.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateProfileSchema = z.object({
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  is_onboarded: z.boolean().optional(),
})

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(async ({ context, data }) => {
    return updateProfile(context.user.id, data)
  })
