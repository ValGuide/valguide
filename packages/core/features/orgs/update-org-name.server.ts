import { eq } from 'drizzle-orm'
import type { DB } from '../db'
import { organization } from './schema'

export async function updateOrgName(db: DB, organizationId: string, newName: string) {
  await db.update(organization).set({ name: newName }).where(eq(organization.id, organizationId))
}
