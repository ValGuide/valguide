import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { updateProfileAvatar } from './update-profile-avatar.server'

const updateProfileAvatarSchema = z.object({
  storagePath: z.string().min(1),
})

export const updateProfileAvatarFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileAvatarSchema)
  .handler(async ({ context, data }) => {
    const expectedPrefix = `users/${context.user.id}/profile-avatars/`
    if (!data.storagePath.startsWith(expectedPrefix)) {
      throw new Error('Invalid storage path')
    }

    await updateProfileAvatar(context.user.id, data.storagePath)
    return { storagePath: data.storagePath }
  })
