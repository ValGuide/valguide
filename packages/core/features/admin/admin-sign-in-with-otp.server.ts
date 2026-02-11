import { isSuperadmin } from './superadmin'

export function checkAdminEmailAllowed(email: string): void {
  if (!isSuperadmin(email)) {
    throw new Error('Email not authorized for admin access')
  }
}
