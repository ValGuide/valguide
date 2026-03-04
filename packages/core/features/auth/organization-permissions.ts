import { createAccessControl, type Role, role } from 'better-auth/plugins/access'
import type { OrgRole } from '../orgs/schema'

const orgRoleValues: OrgRole[] = ['owner', 'admin', 'curator', 'editor', 'viewer']

const orgStatements = {
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
} as const

export const orgAc = createAccessControl(orgStatements)

const noOrganizationPermissions = role({})

export const orgRoles: Record<OrgRole, Role> = {
  owner: orgAc.newRole({
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
    ac: ['create', 'read', 'update', 'delete'],
  }),
  admin: orgAc.newRole({
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
  }),
  curator: noOrganizationPermissions,
  editor: noOrganizationPermissions,
  viewer: noOrganizationPermissions,
}

const roleRank: Record<OrgRole, number> = {
  viewer: 0,
  editor: 1,
  curator: 2,
  admin: 3,
  owner: 4,
}

export function isRoleAtLeast(userRole: OrgRole, minRole: OrgRole): boolean {
  return roleRank[userRole] >= roleRank[minRole]
}

export function parseOrgRole(role: string): OrgRole | null {
  return orgRoleValues.includes(role as OrgRole) ? (role as OrgRole) : null
}
