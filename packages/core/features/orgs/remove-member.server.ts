import type { DB } from '@valguide/core/features/db'
import { and, eq, ne } from 'drizzle-orm'
import type { OrgRole } from './schema'
import { member } from './schema'

export type RemovableMemberRecord = {
  id: string
  userId: string
  role: OrgRole
}

/**
 * Remove a member from a team.
 */
export async function removeMember(dbClient: DB, memberId: string) {
  return dbClient.delete(member).where(eq(member.id, memberId))
}

export async function getMemberForRemoval(
  dbClient: DB,
  organizationId: string,
  memberId: string,
): Promise<RemovableMemberRecord | null> {
  const [foundMember] = await dbClient
    .select({
      id: member.id,
      userId: member.userId,
      role: member.role,
    })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.id, memberId)))
    .limit(1)

  if (!foundMember) {
    return null
  }

  return {
    id: foundMember.id,
    userId: foundMember.userId,
    role: foundMember.role as OrgRole,
  }
}

export async function countOtherOwners(
  dbClient: DB,
  organizationId: string,
  excludedMemberId: string,
): Promise<number> {
  return dbClient.$count(
    member,
    and(eq(member.organizationId, organizationId), eq(member.role, 'owner'), ne(member.id, excludedMemberId)),
  )
}
