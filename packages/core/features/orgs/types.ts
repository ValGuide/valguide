import type { invitation, member, OrgRole, organization } from './schema'

// =============================================================================
// BASE TYPES (inferred from schema)
// =============================================================================

export type Organization = typeof organization.$inferSelect
export type NewOrganization = typeof organization.$inferInsert

export type OrganizationMember = typeof member.$inferSelect
export type NewOrganizationMember = typeof member.$inferInsert

export type OrganizationInvitation = typeof invitation.$inferSelect
export type NewOrganizationInvitation = typeof invitation.$inferInsert

// =============================================================================
// COMPOSITE TYPES
// =============================================================================

/** Organization with the user's role in it */
export type OrganizationWithRole = Organization & {
  role: OrgRole
}

export type { OrgRole }

export interface TeamMember {
  id: string
  userId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  role: OrgRole
  joinedAt: string
}

export interface PendingInvitation {
  id: string
  email: string
  role: OrgRole
  invitedBy: {
    name: string
    email: string
  }
  invitedAt: string
  expiresAt: string
}

export interface TeamData {
  team: Organization
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
}
