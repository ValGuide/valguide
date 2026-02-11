import { db } from '../db'
import type { organizationApprovedDomain } from './schema'

export type ApprovedDomain = typeof organizationApprovedDomain.$inferSelect

export async function getApprovedDomains(): Promise<ApprovedDomain[]> {
  return db.query.organizationApprovedDomain.findMany({
    orderBy: (t, { desc }) => desc(t.createdAt),
  })
}
