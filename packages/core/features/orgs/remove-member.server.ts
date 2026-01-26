import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { organizationMember } from './schema'

/**
 * Remove a member from a team
 */
export async function removeMember(dbClient: DB, memberId: string) {
  return dbClient.delete(organizationMember).where(eq(organizationMember.id, memberId))
}
