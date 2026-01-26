import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { type OrgRole, organizationMember } from './schema'

/**
 * Update a member's role
 */
export async function updateMemberRole(dbClient: DB, memberId: string, role: OrgRole) {
  return dbClient.update(organizationMember).set({ role }).where(eq(organizationMember.id, memberId))
}
