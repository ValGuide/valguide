import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { requestAdminAccess } from './request-admin-access.server'

export const requestAdminAccessFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({}))
  .handler(async ({ context }) => {
    await requestAdminAccess(context.user.email || '')
    return { success: true }
  })
