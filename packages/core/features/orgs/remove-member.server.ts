import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { member } from './schema'

/**
 * Remove a member from a team
 */
export async function removeMember(dbClient: DB, memberId: string) {
  return dbClient.delete(member).where(eq(member.id, memberId))
}
