import type { DB } from '@valguide/core/features/db'
import { getTeamMembers } from '@valguide/core/features/orgs/get-team-members.server'
import { organization } from '@valguide/core/features/orgs/schema'
import { eq } from 'drizzle-orm'

export type AdminOrgMember = {
  memberId: string
  userId: string
  email: string | null
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: Date
}

export async function getOrgMembers(dbClient: DB, nanoId: string): Promise<AdminOrgMember[]> {
  // Resolve nanoId to internal UUID
  const orgs = await dbClient
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.nanoId, nanoId))
    .limit(1)

  const org = orgs[0]
  if (!org) return []

  const members = await getTeamMembers(dbClient, org.id)

  return members.map((m) => ({
    memberId: m.member.id,
    userId: m.member.userId,
    email: m.user?.email ?? null,
    firstName: m.profile?.firstName ?? null,
    lastName: m.profile?.lastName ?? null,
    role: m.member.role,
    createdAt: m.member.createdAt,
  }))
}
