import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { adminUploadOrgLogo } from './admin-upload-org-logo.server'

export type { AdminUploadOrgLogoResult } from './admin-upload-org-logo.server'

export const adminUploadOrgLogoFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      orgNanoId: z.string(),
      base64: z.string(),
      mimeType: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return adminUploadOrgLogo(db, data)
  })
