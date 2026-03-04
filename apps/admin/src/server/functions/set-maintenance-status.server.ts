import {
  disableMaintenance,
  enableMaintenance,
  getMaintenanceStatus,
} from '@valguide/core/features/maintenance/state.server'
import type { MaintenanceApp, MaintenanceStatus } from '@valguide/core/features/maintenance/types'
import { maintenanceToggleMessage } from '@valguide/core/slack/messages/maintenance-toggle.message'
import { postMessage } from '@valguide/core/slack/send-slack-message'

type SetMaintenanceStatusInput = {
  app: MaintenanceApp
  enabled: boolean
  enabledBy: string | null
  message?: string | null
  eta?: string | null
}

function normalizeOptionalValue(value?: string | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function setMaintenanceStatus(input: SetMaintenanceStatusInput): Promise<MaintenanceStatus> {
  const previousStatus = await getMaintenanceStatus(input.app)
  const message = normalizeOptionalValue(input.message)
  const eta = normalizeOptionalValue(input.eta)

  let result: MaintenanceStatus
  try {
    result = input.enabled
      ? await enableMaintenance(input.app, {
          message,
          eta,
          enabledBy: input.enabledBy,
        })
      : await disableMaintenance(input.app)
  } catch (error) {
    console.error('[maintenance] Failed to persist maintenance status', {
      app: input.app,
      enabled: input.enabled,
      error,
    })
    throw error
  }

  if (previousStatus.enabled !== result.enabled) {
    await postMessage(
      maintenanceToggleMessage({
        app: input.app,
        enabled: result.enabled,
        enabledBy: input.enabledBy,
        message: result.message,
        eta: result.eta,
      }),
    )
  }

  return result
}
