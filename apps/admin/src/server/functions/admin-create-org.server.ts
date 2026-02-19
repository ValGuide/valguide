import type { DB } from '@valguide/core/features/db'
import { generateUniqueOrgSlug } from '@valguide/core/features/orgs/generate-unique-org-slug.server'
import { organization, organizationMember } from '@valguide/core/features/orgs/schema'
import { valguideId } from '@valguide/core/utils/nanoid'
import { SLUG_PATTERN } from '@valguide/core/utils/slug'
import { eq } from 'drizzle-orm'
import { authUsers } from 'drizzle-orm/supabase'

export type AdminCreateOrgInput = {
  name: string
  slug?: string
  members?: { email: string; role: 'owner' | 'admin' | 'curator' | 'editor' | 'viewer' }[]
}

export type AdminCreateOrgResult = {
  success: boolean
  org?: { nanoId: string; name: string; slug: string }
  memberErrors?: string[]
  error?: string
}

export async function adminCreateOrg(dbClient: DB, input: AdminCreateOrgInput): Promise<AdminCreateOrgResult> {
  // Determine slug
  let slug: string
  if (input.slug) {
    // Validate slug format
    if (!SLUG_PATTERN.test(input.slug)) {
      return { success: false, error: 'Invalid slug format' }
    }
    // Check uniqueness
    const existing = await dbClient
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, input.slug))
      .limit(1)
    if (existing[0]) {
      return { success: false, error: 'Slug is already taken' }
    }
    slug = input.slug
  } else {
    slug = await generateUniqueOrgSlug(dbClient, input.name)
  }

  const nanoId = valguideId()
  const memberErrors: string[] = []

  const newOrg = await dbClient.transaction(async (tx: DB) => {
    const [created] = await tx.insert(organization).values({ nanoId, name: input.name, slug }).returning()

    if (!created) {
      throw new Error('Failed to create organization')
    }

    // Add members if provided
    if (input.members?.length) {
      for (const member of input.members) {
        const users = await tx
          .select({ id: authUsers.id })
          .from(authUsers)
          .where(eq(authUsers.email, member.email))
          .limit(1)

        const user = users[0]
        if (!user) {
          memberErrors.push(`User not found: ${member.email}`)
          continue
        }

        await tx.insert(organizationMember).values({
          organizationId: created.id,
          userId: user.id,
          role: member.role,
          isOwner: member.role === 'owner',
        })
      }
    }

    return created
  })

  return {
    success: true,
    org: { nanoId: newOrg.nanoId, name: newOrg.name, slug: newOrg.slug },
    memberErrors: memberErrors.length > 0 ? memberErrors : undefined,
  }
}
