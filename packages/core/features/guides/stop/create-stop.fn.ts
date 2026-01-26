import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { createStop } from './create-stop.server'

export type { CreateStopInput, CreateStopResult } from './create-stop.server'

const createStopSchema = z.object({
  title: z.string().min(1),
  locale: z.string().optional(),
})

export const createStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createStopSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return createStop(data, orgId, context.user.id)
  })
