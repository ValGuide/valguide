import { memberInvitedMessage } from '@valguide/slack/messages/member-invited.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'
import { eq } from 'drizzle-orm'
import { authUsers } from '../auth/schema'
import { db } from '../db'
import { invitation, organization } from './schema'

type NotifyMemberInvitedInput = {
  invitationId: string
}

export async function notifyMemberInvited({ invitationId }: NotifyMemberInvitedInput): Promise<void> {
  const [invite] = await db
    .select({
      id: invitation.id,
      createdAt: invitation.createdAt,
      email: invitation.email,
      inviterEmail: authUsers.email,
      organizationName: organization.name,
      role: invitation.role,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .leftJoin(authUsers, eq(invitation.inviterId, authUsers.id))
    .where(eq(invitation.id, invitationId))
    .limit(1)

  if (!invite) {
    console.error(`[Slack][member_invited] Invitation not found for notification: ${invitationId}`)
    return
  }

  try {
    await sendSlackMessage(
      memberInvitedMessage({
        invitationId: invite.id,
        invitedEmail: invite.email,
        inviterEmail: invite.inviterEmail ?? null,
        orgName: invite.organizationName,
        role: invite.role,
        timestampMs: invite.createdAt.getTime(),
      }),
    )
  } catch (error) {
    console.error(`[Slack][member_invited] Failed to send notification for invitation ${invitationId}:`, error)
  }
}
