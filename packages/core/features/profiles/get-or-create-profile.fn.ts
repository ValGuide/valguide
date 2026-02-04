import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../auth/middleware'
import { getOrCreateProfile } from './get-or-create-profile.server'

export type { Profile } from './get-or-create-profile.server'

export const getOrCreateProfileFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return getOrCreateProfile(context.user.id)
  })
