import { createServerFn } from '@tanstack/react-start'

import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { updateProfile } from '@valguide/features/profiles/mutations'
import { profileSchema } from './schemas'

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(profileSchema)
  .handler(
    handleError(async ({ data, context }) => {
      const user = context.user
      const validated = profileSchema.safeParse(data)
      if (!validated.success) {
        return { success: false, validationError: true }
      }

      try {
        await updateProfile(user.id, {
          username: validated.data.username || null,
          firstName: validated.data.firstName || null,
          lastName: validated.data.lastName || null,
        })

        return { success: true }
      } catch (error) {
        console.error('Profile update error:', error)
        return { success: false }
      }
    }),
  )
