import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { updateProfile } from './mutations'
import { getProfile } from './queries'

const getProfileSchema = z.object({ userId: z.string() })

export const getProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(getProfileSchema)
  .handler(async ({ data }) => getProfile(data.userId))

const updateProfileSchema = z.object({
  userId: z.string(),
  data: z.object({
    is_onboarded: z.boolean().optional(),
    username: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    onboardedAt: z.date().optional(),
  }),
})

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => updateProfile(data.userId, data.data))
