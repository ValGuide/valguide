import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../auth/middleware'
import { isSuperadmin } from './superadmin'

export const checkSuperadminFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return { allowed: isSuperadmin(context.user.email) }
  })
