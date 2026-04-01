import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { notifyTeamCreated } from '@valguide/core/features/orgs/notify-team-created.server'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminCreateOrg } from './admin-create-org.server'

export type { AdminCreateOrgResult } from './admin-create-org.server'

export const adminCreateOrgFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(1).max(255),
      slug: z.string().min(3).max(100).optional(),
      members: z
        .array(
          z.object({
            email: z.string().email(),
            role: z.enum(['owner', 'admin', 'curator', 'editor', 'viewer']),
          }),
        )
        .optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const result = await adminCreateOrg(db, {
      ...data,
      actorEmail: context.user.email ?? null,
    })

    if (result.success && result.org) {
      await notifyTeamCreated({
        actorEmail: context.user.email ?? null,
        createdVia: 'admin',
        orgName: result.org.name,
        orgNanoId: result.org.nanoId,
        orgSlug: result.org.slug,
      })
    }

    return result
  })
