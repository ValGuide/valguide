import type { DB } from '@valguide/core/features/db'
import { and, asc, count, desc, ilike, sql } from 'drizzle-orm'
import { organization, organizationMember } from '@valguide/core/features/orgs/schema'
import { tour } from '@valguide/core/features/tours/schema'

export type AdminOrgListItem = {
  nanoId: string
  name: string
  logo: string | null
  memberCount: number
  tourCount: number
  createdAt: Date
}

export type ListOrgsInput = {
  page: number
  pageSize: number
  search?: string
  sortBy: 'name' | 'memberCount' | 'tourCount' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

export type ListOrgsResult = {
  orgs: AdminOrgListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export async function listOrgs(dbClient: DB, input: ListOrgsInput): Promise<ListOrgsResult> {
  const { page, pageSize, search, sortBy, sortOrder } = input

  const conditions = []

  if (search) {
    const pattern = `%${search}%`
    conditions.push(ilike(organization.name, pattern))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const memberCountSubquery = sql<number>`(
		SELECT count(*)::int
		FROM ${organizationMember}
		WHERE ${organizationMember.organizationId} = ${organization.id}
	)`

  const tourCountSubquery = sql<number>`(
		SELECT count(*)::int
		FROM ${tour}
		WHERE ${tour.organizationId} = ${organization.id}
	)`

  const direction = sortOrder === 'asc' ? asc : desc
  const orderClauses = (() => {
    switch (sortBy) {
      case 'name':
        return [direction(organization.name)]
      case 'memberCount':
        return [direction(memberCountSubquery)]
      case 'tourCount':
        return [direction(tourCountSubquery)]
      case 'createdAt':
        return [direction(organization.createdAt)]
    }
  })()

  const [rows, [countResult]] = await Promise.all([
    dbClient
      .select({
        org: organization,
        memberCount: memberCountSubquery,
        tourCount: tourCountSubquery,
      })
      .from(organization)
      .where(whereClause)
      .orderBy(...orderClauses)
      .limit(pageSize)
      .offset(page * pageSize),
    dbClient.select({ total: count() }).from(organization).where(whereClause),
  ])

  return {
    orgs: rows.map((row) => ({
      nanoId: row.org.nanoId,
      name: row.org.name,
      logo: row.org.logo,
      memberCount: row.memberCount,
      tourCount: row.tourCount,
      createdAt: row.org.createdAt,
    })),
    totalCount: countResult?.total ?? 0,
    page,
    pageSize,
  }
}
