import { createMiddleware } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../auth/middleware'
import { isSuperadmin } from './superadmin'

export const requireSuperadminMiddleware = createMiddleware({ type: 'function' })
  .middleware([requireAuthMiddleware])
  .server(async ({ next, context }) => {
    if (!isSuperadmin(context.user.email)) {
      throw new Error('Forbidden: superadmin access required')
    }
    return next({ context })
  })
