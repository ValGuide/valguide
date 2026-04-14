import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireAuthMiddleware } from '../auth/middleware'
import { updateProfileAvatar } from './update-profile-avatar.server'

const updateProfileAvatarSchema = z.object({
  storagePath: z.string().min(1),
})

export const updateProfileAvatarFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileAvatarSchema)
  .handler(async ({ context, data }) => {
    const expectedPrefix = `users/${context.user.id}/avatars/`
    if (!data.storagePath.startsWith(expectedPrefix)) {
      throw new Error('Invalid storage path')
    }

    await updateProfileAvatar(context.user.id, data.storagePath)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'profile.avatar_updated',
    })
    return { storagePath: data.storagePath }
  })
