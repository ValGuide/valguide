import type { SlackMessage } from '@valguide/slack/slack-message'
import type { MaintenanceApp } from '../../features/maintenance/types'

type MaintenanceToggleMessageInput = {
  app: MaintenanceApp
  enabled: boolean
  enabledBy: string | null
  message: string | null
  eta: string | null
}

function appLabel(app: MaintenanceApp): string {
  return app === 'studio' ? 'Studio' : 'App'
}

export const maintenanceToggleMessage = ({
  app,
  enabled,
  enabledBy,
  message,
  eta,
}: MaintenanceToggleMessageInput): SlackMessage => {
  const title = enabled ? '🛠️ Maintenance enabled' : '✅ Maintenance disabled'
  const details = [
    `*Target* ${appLabel(app)}`,
    `*State* ${enabled ? 'Enabled' : 'Disabled'}`,
    `*By* ${enabledBy ?? 'Unknown'}`,
    message ? `*Message* ${message}` : null,
    eta ? `*ETA* ${eta}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return {
    channel: 'valguide-users',
    text: `${title} (${appLabel(app)})`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: details,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Open Admin',
            },
            url: 'https://ops.val.guide/maintenance',
            action_id: 'open_maintenance_admin',
          },
        ],
      },
      {
        type: 'divider',
      },
    ],
  }
}
