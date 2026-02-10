import type { DB } from '@valguide/core/features/db'
import { count, desc, eq } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'
import { organizationMember } from '../../orgs/schema'
import { profiles } from '../../profiles/schema'

export type AdminUserListItem = {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  status: 'pending' | 'approved' | 'blocked'
  createdAt: Date
  approvedAt: Date | null
  blockedAt: Date | null
  blockedReason: string | null
  orgCount: number
}

export async function listUsers(
  dbClient: DB,
  filter?: { status?: 'pending' | 'approved' | 'blocked' },
): Promise<AdminUserListItem[]> {
  const rows = await dbClient
    .select({
      profile: profiles,
      user: authUsers,
    })
    .from(profiles)
    .leftJoin(authUsers, eq(profiles.id, authUsers.id))
    .where(filter?.status ? eq(profiles.status, filter.status) : undefined)
    .orderBy(desc(profiles.createdAt))

  const orgCounts = await dbClient
    .select({
      userId: organizationMember.userId,
      count: count(),
    })
    .from(organizationMember)
    .groupBy(organizationMember.userId)

  const orgCountMap = new Map(orgCounts.map((r) => [r.userId, r.count]))

  return rows.map((row) => ({
    id: row.profile.id,
    email: row.user?.email ?? null,
    firstName: row.profile.firstName,
    lastName: row.profile.lastName,
    status: row.profile.status,
    createdAt: row.profile.createdAt,
    approvedAt: row.profile.approvedAt,
    blockedAt: row.profile.blockedAt,
    blockedReason: row.profile.blockedReason,
    orgCount: orgCountMap.get(row.profile.id) ?? 0,
  }))
}
