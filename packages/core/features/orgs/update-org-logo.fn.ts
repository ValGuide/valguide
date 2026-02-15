import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { updateOrgLogo } from './update-org-logo.server'

const updateOrgLogoSchema = z.object({
  organizationId: z.string(),
  storagePath: z.string().min(1),
})

export const updateOrgLogoFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateOrgLogoSchema)
  .handler(async ({ context, data }) => {
    await requireOrgMember(data.organizationId, context.user.id)

    if (!data.storagePath.startsWith('orgs/')) {
      throw new Error('Invalid storage path')
    }

    const supabase = await createClient()
    const {
      data: { publicUrl },
    } = supabase.storage.from('assets').getPublicUrl(data.storagePath)

    await updateOrgLogo(db, data.organizationId, publicUrl)
    return { publicUrl }
  })
