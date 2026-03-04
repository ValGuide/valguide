import { adminEnv } from '../env'

export function isSuperadmin(email: string | undefined): boolean {
  if (!email) return false
  const superadminEmails = adminEnv.ADMIN_ALLOWED_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  return superadminEmails.includes(email.toLowerCase())
}
