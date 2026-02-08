import { eq } from 'drizzle-orm'
import type { DB } from '../db'
import { organization } from './schema'

export async function updateOrgLogo(db: DB, organizationId: string, logoUrl: string | null) {
  const [org] = await db
    .update(organization)
    .set({ logo: logoUrl })
    .where(eq(organization.id, organizationId))
    .returning({ logo: organization.logo })
  return org?.logo ?? null
}
