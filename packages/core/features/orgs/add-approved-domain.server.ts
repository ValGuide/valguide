import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { organizationApprovedDomain } from './schema'

export type AddApprovedDomainInput = z.infer<typeof addApprovedDomainInputSchema>
export const addApprovedDomainInputSchema = z.object({
  organizationId: z.string().uuid(),
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

export async function addApprovedDomain(
  input: AddApprovedDomainInput,
): Promise<typeof organizationApprovedDomain.$inferSelect> {
  // Check if domain already exists
  const existing = await db.query.organizationApprovedDomain.findFirst({
    where: eq(organizationApprovedDomain.domain, input.domain),
  })

  if (existing) {
    throw new ApprovedDomainError(
      `Domain "${input.domain}" is already approved for organization "${existing.organizationId}"`,
      'DOMAIN_ALREADY_EXISTS',
    )
  }

  const [created] = await db
    .insert(organizationApprovedDomain)
    .values({
      organizationId: input.organizationId,
      domain: input.domain,
    })
    .returning()

  return created
}
