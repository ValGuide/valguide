import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { adminMiddleware } from '../middleware'
import { getAdminMaintenanceStatus } from './get-maintenance-status.server'
import { setMaintenanceStatus } from './set-maintenance-status.server'

const setMaintenanceStatusSchema = z.object({
  app: z.enum(['studio', 'app']),
  enabled: z.boolean(),
  message: z.string().max(500).optional(),
  eta: z.string().max(64).optional(),
})

export type SetMaintenanceStatusInput = z.infer<typeof setMaintenanceStatusSchema>

export const setMaintenanceStatusFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(setMaintenanceStatusSchema)
  .handler(async ({ context, data }) => {
    await setMaintenanceStatus({
      app: data.app,
      enabled: data.enabled,
      message: data.message,
      eta: data.eta,
      enabledBy: context.user.email ?? null,
    })

    return getAdminMaintenanceStatus()
  })
