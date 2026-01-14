import { createServerFn } from '@tanstack/react-start'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { getProfile } from '@valguide/features/profiles/queries'

export const getProfileFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(
    handleError(async ({ context }) => {
      const userId = context.user.id
      const profile = await getProfile(userId)

      if (!profile) {
        return null
      }

      return profile
    }),
  )
