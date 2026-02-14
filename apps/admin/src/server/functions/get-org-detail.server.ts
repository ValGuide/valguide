import type { DB } from '@valguide/core/features/db'
import { organization, organizationMember } from '@valguide/core/features/orgs/schema'
import { tour } from '@valguide/core/features/tours/schema'
import { and, eq, isNull } from 'drizzle-orm'

export type AdminOrgDetail = {
  nanoId: string
  name: string
  logo: string | null
  memberCount: number
  tourCount: number
  createdAt: Date
  updatedAt: Date | null
}

export async function getOrgDetail(dbClient: DB, nanoId: string): Promise<AdminOrgDetail | null> {
  const memberCountSubquery = dbClient.$count(
    organizationMember,
    eq(organizationMember.organizationId, organization.id),
  )

  const tourCountSubquery = dbClient.$count(tour, and(eq(tour.organizationId, organization.id), isNull(tour.deletedAt)))

  const rows = await dbClient
    .select({
      org: organization,
      memberCount: memberCountSubquery,
      tourCount: tourCountSubquery,
    })
    .from(organization)
    .where(eq(organization.nanoId, nanoId))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  return {
    nanoId: row.org.nanoId,
    name: row.org.name,
    logo: row.org.logo,
    memberCount: row.memberCount,
    tourCount: row.tourCount,
    createdAt: row.org.createdAt,
    updatedAt: row.org.updatedAt,
  }
}
