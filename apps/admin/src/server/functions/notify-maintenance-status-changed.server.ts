import type { MaintenanceApp } from '@valguide/core/features/maintenance/types'
import { maintenanceToggleMessage } from '@valguide/core/slack/messages/maintenance-toggle.message'
import { sendSlackMessage } from '@valguide/core/slack/send-slack-message'

type NotifyMaintenanceStatusChangedInput = {
  app: MaintenanceApp
  enabled: boolean
  enabledBy: string | null
  eta?: string | null
  message?: string | null
}

export async function notifyMaintenanceStatusChanged({
  app,
  enabled,
  enabledBy,
  eta,
  message,
}: NotifyMaintenanceStatusChangedInput): Promise<void> {
  try {
    await sendSlackMessage(
      maintenanceToggleMessage({
        app,
        enabled,
        enabledBy,
        eta: eta ?? null,
        message: message ?? null,
      }),
    )
  } catch (error) {
    console.error(`[Slack][maintenance_status_changed] Failed to send notification for app ${app}:`, error)
  }
}
