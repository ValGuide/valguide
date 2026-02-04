import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { generateDevMagicLink } from './dev-auth.server'

export type { DevAuthResult } from './dev-auth.server'

export const getDevMagicLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ email: z.string().email().optional() }))
  .handler(async ({ data }) => {
    return generateDevMagicLink(data.email)
  })
