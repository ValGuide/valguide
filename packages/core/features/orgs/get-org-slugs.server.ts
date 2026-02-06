import { desc, eq } from 'drizzle-orm'
import type { DB } from '../db'
import { organizationSlug } from './schema'

export type OrgSlugRecord = {
  id: string
  slug: string
  isPrimary: boolean
  createdAt: string
}

export async function getOrgSlugs(db: DB, organizationId: string): Promise<OrgSlugRecord[]> {
  const slugs = await db
    .select({
      id: organizationSlug.id,
      slug: organizationSlug.slug,
      isPrimary: organizationSlug.isPrimary,
      createdAt: organizationSlug.createdAt,
    })
    .from(organizationSlug)
    .where(eq(organizationSlug.organizationId, organizationId))
    .orderBy(desc(organizationSlug.isPrimary), desc(organizationSlug.createdAt))

  return slugs.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }))
}
