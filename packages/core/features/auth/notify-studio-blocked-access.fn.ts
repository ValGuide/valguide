import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authContextMiddleware } from './middleware'
import { notifyStudioBlockedAccess } from './notify-studio-blocked-access.server'

export const notifyStudioBlockedAccessFn = createServerFn({ method: 'POST' })
  .middleware([authContextMiddleware])
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    if (!context.user) {
      return { success: false }
    }

    await notifyStudioBlockedAccess({ email: context.user.email ?? '' })
    return { success: true }
  })
