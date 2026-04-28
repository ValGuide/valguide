import { adminEnv } from '../env'

export function isAdminEmailAllowed(email: string | undefined, allowedEmails: string): boolean {
  if (!email) return false
  const superadminEmails = allowedEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return superadminEmails.includes(email.toLowerCase())
}

export function isSuperadmin(email: string | undefined): boolean {
  return isAdminEmailAllowed(email, adminEnv.ADMIN_ALLOWED_EMAILS)
}
