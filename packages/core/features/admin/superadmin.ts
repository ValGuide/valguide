import { serverEnv } from '@valguide/core/env/server'

export function isSuperadmin(email: string | undefined): boolean {
  if (!email) return false
  const superadminEmails = serverEnv.ADMIN_ALLOWED_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  return superadminEmails.includes(email.toLowerCase())
}
