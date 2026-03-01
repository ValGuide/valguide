import { authUsers } from '@valguide/core/features/auth/schema'
import type { DB } from '@valguide/core/features/db'
import { organizationMember } from '@valguide/core/features/orgs/schema'
import { profiles } from '@valguide/core/features/profiles/schema'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'

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

export type ListUsersInput = {
  page: number
  pageSize: number
  search?: string
  status?: 'pending' | 'approved' | 'blocked'
  sortBy: 'email' | 'name' | 'status' | 'createdAt' | 'orgCount'
  sortOrder: 'asc' | 'desc'
}

export type ListUsersResult = {
  users: AdminUserListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export async function listUsers(dbClient: DB, input: ListUsersInput): Promise<ListUsersResult> {
  const { page, pageSize, search, status, sortBy, sortOrder } = input

  const conditions = []

  if (status) {
    conditions.push(eq(profiles.status, status))
  }

  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(ilike(authUsers.email, pattern), ilike(profiles.firstName, pattern), ilike(profiles.lastName, pattern)),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const orgCountSubquery = dbClient.$count(organizationMember, eq(organizationMember.userId, profiles.id))

  const direction = sortOrder === 'asc' ? asc : desc
  const orderClauses = (() => {
    switch (sortBy) {
      case 'email':
        return [direction(authUsers.email)]
      case 'name':
        return [direction(profiles.firstName), direction(profiles.lastName)]
      case 'status':
        return [direction(profiles.status)]
      case 'createdAt':
        return [direction(profiles.createdAt)]
      case 'orgCount':
        return [direction(orgCountSubquery)]
    }
  })()

  const [rows, [countResult]] = await Promise.all([
    dbClient
      .select({
        profile: profiles,
        user: authUsers,
        orgCount: orgCountSubquery,
      })
      .from(profiles)
      .leftJoin(authUsers, eq(profiles.id, authUsers.id))
      .where(whereClause)
      .orderBy(...orderClauses)
      .limit(pageSize)
      .offset(page * pageSize),
    dbClient
      .select({ total: count() })
      .from(profiles)
      .leftJoin(authUsers, eq(profiles.id, authUsers.id))
      .where(whereClause),
  ])

  return {
    users: rows.map((row) => ({
      id: row.profile.id,
      email: row.user?.email ?? null,
      firstName: row.profile.firstName,
      lastName: row.profile.lastName,
      status: row.profile.status,
      createdAt: row.profile.createdAt,
      approvedAt: row.profile.approvedAt,
      blockedAt: row.profile.blockedAt,
      blockedReason: row.profile.blockedReason,
      orgCount: row.orgCount,
    })),
    totalCount: countResult?.total ?? 0,
    page,
    pageSize,
  }
}
