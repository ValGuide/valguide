import { getMaintenanceStatusForApps } from '@valguide/core/features/maintenance/state.server'
import type { MaintenanceStatus } from '@valguide/core/features/maintenance/types'

export type AdminMaintenanceStatus = {
  studio: MaintenanceStatus
  app: MaintenanceStatus
}

export async function getAdminMaintenanceStatus(): Promise<AdminMaintenanceStatus> {
  const statuses = await getMaintenanceStatusForApps(['studio', 'app'] as const)
  return {
    studio: statuses.studio,
    app: statuses.app,
  }
}
