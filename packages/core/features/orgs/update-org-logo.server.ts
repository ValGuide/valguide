import { eq } from 'drizzle-orm'
import type { DB } from '../db'
import { organization } from './schema'

export async function updateOrgLogo(db: DB, organizationId: string, storagePath: string | null) {
  const [org] = await db
    .update(organization)
    .set({ logoStoragePath: storagePath })
    .where(eq(organization.id, organizationId))
    .returning({ logoStoragePath: organization.logoStoragePath })
  return org?.logoStoragePath ?? null
}
