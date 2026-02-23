import { db } from '../db'
import type { ApprovedDomain } from './schema'

export type { ApprovedDomain }

export async function getApprovedDomains(): Promise<ApprovedDomain[]> {
  return db.query.approvedDomain.findMany({
    orderBy: (t, { desc }) => desc(t.createdAt),
  })
}
