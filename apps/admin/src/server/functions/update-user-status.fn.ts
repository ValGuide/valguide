import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { updateUserStatus } from './update-user-status.server'

const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['approved', 'blocked']),
  blockedReason: z.string().optional(),
})

export const adminUpdateUserStatusFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(updateUserStatusSchema)
  .handler(async ({ context, data }) => {
    return updateUserStatus(db, {
      ...data,
      actorEmail: context.user.email,
    })
  })
