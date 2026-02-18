import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { approvedDomain } from './schema'

export type AddApprovedDomainInput = z.infer<typeof addApprovedDomainInputSchema>
export const addApprovedDomainInputSchema = z.object({
  domain: z.string().toLowerCase().trim().min(3),
})

export class ApprovedDomainError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
  }
}

export async function addApprovedDomain(input: AddApprovedDomainInput): Promise<typeof approvedDomain.$inferSelect> {
  const existing = await db.query.approvedDomain.findFirst({
    where: eq(approvedDomain.domain, input.domain),
  })

  if (existing) {
    throw new ApprovedDomainError(`Domain "${input.domain}" is already approved`, 'DOMAIN_ALREADY_EXISTS')
  }

  const [created] = await db
    .insert(approvedDomain)
    .values({
      domain: input.domain,
    })
    .returning()

  return created
}
