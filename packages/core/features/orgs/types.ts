import type { organization, organizationInvitation, organizationMember } from './schema'

// =============================================================================
// BASE TYPES (inferred from schema)
// =============================================================================

export type Organization = typeof organization.$inferSelect
export type NewOrganization = typeof organization.$inferInsert

export type OrganizationMember = typeof organizationMember.$inferSelect
export type NewOrganizationMember = typeof organizationMember.$inferInsert

export type OrganizationInvitation = typeof organizationInvitation.$inferSelect
export type NewOrganizationInvitation = typeof organizationInvitation.$inferInsert

// =============================================================================
// COMPOSITE TYPES
// =============================================================================

/** Organization with the user's role in it */
export type OrganizationWithRole = Organization & {
  role: OrganizationMember['role']
}
