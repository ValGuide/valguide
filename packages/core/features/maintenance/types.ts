export type MaintenanceApp = 'studio' | 'app'

export type MaintenanceState = {
  enabled: true
  message: string | null
  eta: string | null
  enabledAt: string
  enabledBy: string | null
}

export type MaintenanceStatus = {
  app: MaintenanceApp
  enabled: boolean
  message: string | null
  eta: string | null
  enabledAt: string | null
  enabledBy: string | null
}

export type EnableMaintenanceInput = {
  message?: string | null
  eta?: string | null
  enabledBy?: string | null
}
