import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '../middleware'
import { getAdminMaintenanceStatus } from './get-maintenance-status.server'

export type { AdminMaintenanceStatus } from './get-maintenance-status.server'

export const getMaintenanceStatusFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    return getAdminMaintenanceStatus()
  })
