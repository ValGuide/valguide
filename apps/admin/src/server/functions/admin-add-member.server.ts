import { authUsers } from '@valguide/core/features/auth/schema'
import type { DB } from '@valguide/core/features/db'
import { type OrgRole, organization, organizationMember } from '@valguide/core/features/orgs/schema'
import { and, eq } from 'drizzle-orm'

export type AddMemberInput = {
  orgNanoId: string
  email: string
  role: OrgRole
}

export type AddMemberResult = {
  success: boolean
  error?: string
}

export async function adminAddMember(dbClient: DB, input: AddMemberInput): Promise<AddMemberResult> {
  // Resolve org nanoId to internal UUID
  const orgs = await dbClient
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.nanoId, input.orgNanoId))
    .limit(1)

  const org = orgs[0]
  if (!org) return { success: false, error: 'Organization not found' }

  // Find user by email
  const users = await dbClient
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.email, input.email))
    .limit(1)

  const user = users[0]
  if (!user) return { success: false, error: 'User not found' }

  // Check if already a member
  const existing = await dbClient
    .select({ id: organizationMember.id })
    .from(organizationMember)
    .where(and(eq(organizationMember.organizationId, org.id), eq(organizationMember.userId, user.id)))
    .limit(1)

  if (existing[0])
    return {
      success: false,
      error: 'User is already a member of this organization',
    }

  // Insert member directly
  await dbClient.insert(organizationMember).values({
    organizationId: org.id,
    userId: user.id,
    role: input.role,
  })

  return { success: true }
}
