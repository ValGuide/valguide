import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from './middleware'
import { notifyStudioBlockedAccess } from './notify-studio-blocked-access.server'

export const notifyStudioBlockedAccessFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    await notifyStudioBlockedAccess({ email: context.user.email ?? '' })
    return { success: true }
  })
