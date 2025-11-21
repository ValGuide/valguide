export type OrgRole = 'owner' | 'admin' | 'curator' | 'editor' | 'viewer'

const roleHierarchy: Record<OrgRole, number> = {
  viewer: 0,
  editor: 1,
  curator: 2,
  admin: 3,
  owner: 4,
}

export function hasMinRole(userRole: OrgRole, minRole: OrgRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minRole]
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
