import type { DB } from '@valguide/core/features/db'
import { organization } from '@valguide/core/features/orgs/schema'
import { eq } from 'drizzle-orm'

export type AdminUpdateOrgNameInput = {
  orgNanoId: string
  name: string
}

export async function adminUpdateOrgName(dbClient: DB, input: AdminUpdateOrgNameInput): Promise<void> {
  const orgs = await dbClient
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.nanoId, input.orgNanoId))
    .limit(1)

  const org = orgs[0]
  if (!org) throw new Error('Organization not found')

  await dbClient.update(organization).set({ name: input.name }).where(eq(organization.id, org.id))
}
