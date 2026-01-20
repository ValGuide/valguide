import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { getProfile } from '@valguide/features/profiles/queries'

export const getProfileFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    const profile = await getProfile(userId)

    if (!profile) {
      return null
    }

    return profile
  })
