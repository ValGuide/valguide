import { eq } from 'drizzle-orm'
import { db } from '../db'
import { organizationMember } from './schema'

/**
 * Lightweight lookup: returns the first org ID the user belongs to.
 * Used by the auth middleware as a fallback when the active-team-id cookie
 * is missing (e.g., first SSR pass after login).
 */
export async function resolveFirstOrgId(userId: string): Promise<string | null> {
  const membership = await db
    .select({ organizationId: organizationMember.organizationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, userId))
    .limit(1)

  return membership[0]?.organizationId ?? null
}
