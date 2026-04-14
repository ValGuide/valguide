import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { waitUntil } from '../../utils/wait-until'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { writeOrgSlugToKv } from '../tours/public/kv'
import { updateOrgSlug } from './update-org-slug.server'

export type { UpdateOrgSlugResult } from './update-org-slug.server'

const updateOrgSlugSchema = z.object({
  organizationId: z.string(),
  newSlug: z.string(),
})

export const updateOrgSlugFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateOrgSlugSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)
    const result = await updateOrgSlug(db, data.organizationId, data.newSlug)

    if (result.success) {
      captureStudioProductEvent({
        distinctId: context.user.id,
        event: 'org.slug_updated',
        organizationNanoId: result.nanoId,
        properties: {
          new_slug: data.newSlug,
        },
      })

      const kvEntry = { nanoId: result.nanoId, primarySlug: data.newSlug }
      waitUntil(
        Promise.all([
          writeOrgSlugToKv(data.newSlug, kvEntry),
          ...(result.oldSlug !== data.newSlug ? [writeOrgSlugToKv(result.oldSlug, kvEntry)] : []),
        ]),
      )
    }

    return result
  })
