import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { member, type OrgRole } from './schema'

/**
 * Update a member's role
 */
export async function updateMemberRole(dbClient: DB, memberId: string, role: OrgRole) {
  return dbClient.update(member).set({ role }).where(eq(member.id, memberId))
}
