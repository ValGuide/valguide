import { isRoleAtLeast } from '../auth/organization-permissions'
import type { OrgRole } from './schema'

export type { OrgRole }

export function hasMinRole(userRole: OrgRole, minRole: OrgRole): boolean {
  return isRoleAtLeast(userRole, minRole)
}

export function canPublishContent(role: OrgRole): boolean {
  return hasMinRole(role, 'curator')
}

export function canManageMembers(role: OrgRole): boolean {
  return hasMinRole(role, 'admin')
}

export function canDeleteContent(role: OrgRole): boolean {
  return hasMinRole(role, 'admin')
}

export function canManageBilling(role: OrgRole): boolean {
  return hasMinRole(role, 'admin')
}

export function canDeleteTeam(role: OrgRole): boolean {
  return role === 'owner'
}
