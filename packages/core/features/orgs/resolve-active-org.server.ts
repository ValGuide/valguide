import { eq } from 'drizzle-orm'
import { db } from '../db'
import { member } from './schema'

/**
 * Lightweight lookup: returns the first org ID the user belongs to.
 * Used by auth middleware as a fallback when the session has no active org.
 */
export async function resolveFirstOrgId(userId: string): Promise<string | null> {
  const membership = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1)

  return membership[0]?.organizationId ?? null
}
