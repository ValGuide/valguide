import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware'
import { isSuperadmin } from '../utils/superadmin'

export const checkSuperadminFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    return { allowed: isSuperadmin(context.user.email) }
  })
