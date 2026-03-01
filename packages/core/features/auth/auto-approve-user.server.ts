import { and, eq, gt, isNull, or, sql } from 'drizzle-orm'
import { db } from '../db'
import { invitation } from '../orgs/schema'
import { profiles } from '../profiles/schema'
import { approvedDomain } from './schema'

export async function autoApproveIfEligible(userId: string, email: string): Promise<boolean> {
  const emailNorm = email.trim().toLowerCase()
  const domain = emailNorm.split('@')[1]
  if (!domain) return false

  const hasInvite = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      and(
        eq(sql`lower(${invitation.email})`, emailNorm),
        eq(invitation.status, 'pending'),
        or(isNull(invitation.expiresAt), gt(invitation.expiresAt, new Date())),
      ),
    )
    .limit(1)

  const hasApprovedDomain = await db
    .select({ id: approvedDomain.id })
    .from(approvedDomain)
    .where(eq(approvedDomain.domain, domain))
    .limit(1)

  if (hasInvite.length === 0 && hasApprovedDomain.length === 0) {
    return false
  }

  const result = await db
    .update(profiles)
    .set({
      status: 'approved',
      approvedAt: new Date(),
    })
    .where(and(eq(profiles.id, userId), eq(profiles.status, 'pending')))

  return result.length > 0
}
