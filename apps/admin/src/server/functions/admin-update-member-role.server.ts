import type { DB } from '@valguide/core/features/db'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { updateMemberRole } from '@valguide/core/features/orgs/update-member-role.server'

export async function adminUpdateMemberRole(dbClient: DB, memberId: string, role: OrgRole) {
  return updateMemberRole(dbClient, memberId, role)
}
