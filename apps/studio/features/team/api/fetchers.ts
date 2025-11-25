import { type OrgRole, type TeamMember } from '@valguide/core/features/orgs/components/members-table'
import { type PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'

export interface TeamData {
  team: any
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
}

export async function fetchTeamData(): Promise<TeamData | null> {
  const res = await fetch('/api/team')

  if (res.status === 401) {
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch team data: ${res.statusText}`)
  }

  const data = await res.json()
  return data
}
