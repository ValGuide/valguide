import type { DB } from '@valguide/core/features/db'
import { removeMember } from '@valguide/core/features/orgs/remove-member.server'

export async function adminRemoveMember(dbClient: DB, memberId: string) {
  return removeMember(dbClient, memberId)
}
