import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../auth/middleware'
import { getProfile } from './get-profile.server'

export const getProfileFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return getProfile(context.user.id)
  })
