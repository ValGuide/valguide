import { eq } from 'drizzle-orm'
import { db } from '../db'
import { approvedDomain } from './schema'

export async function deleteApprovedDomain(domainId: string): Promise<void> {
  await db.delete(approvedDomain).where(eq(approvedDomain.id, domainId))
}
