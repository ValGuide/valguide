import { teamCreatedMessage } from '@valguide/slack/messages/team-created.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'

type NotifyTeamCreatedInput = {
  actorEmail: string | null
  createdVia: 'admin' | 'studio'
  orgName: string
  orgNanoId: string
  orgSlug: string
}

export async function notifyTeamCreated({
  actorEmail,
  createdVia,
  orgName,
  orgNanoId,
  orgSlug,
}: NotifyTeamCreatedInput): Promise<void> {
  try {
    await sendSlackMessage(
      teamCreatedMessage({
        actorEmail,
        createdVia,
        orgName,
        orgNanoId,
        orgSlug,
        timestampMs: Date.now(),
      }),
    )
  } catch (error) {
    console.error(`[Slack][team_created] Failed to send notification for org ${orgNanoId}:`, error)
  }
}
