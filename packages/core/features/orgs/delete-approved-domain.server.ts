import { eq } from 'drizzle-orm'
import { db } from '../db'
import { organizationApprovedDomain } from './schema'

export async function deleteApprovedDomain(domainId: string): Promise<void> {
  await db.delete(organizationApprovedDomain).where(eq(organizationApprovedDomain.id, domainId))
}
