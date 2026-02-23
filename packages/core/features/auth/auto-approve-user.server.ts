import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { db } from '../db'
import { organizationInvitation } from '../orgs/schema'
import { profiles } from '../profiles/schema'
import { approvedDomain } from './schema'

export async function autoApproveIfEligible(userId: string, email: string): Promise<boolean> {
  const emailNorm = email.trim().toLowerCase()
  const domain = emailNorm.split('@')[1]
  if (!domain) return false

  const hasInvite = await db
    .select({ id: organizationInvitation.id })
    .from(organizationInvitation)
    .where(
      and(
        eq(sql`lower(${organizationInvitation.email})`, emailNorm),
        isNull(organizationInvitation.canceledAt),
        gt(organizationInvitation.expiresAt, new Date()),
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
