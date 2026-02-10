import { serverEnv } from '../../env/server'

function getAllowedEmails(): string[] {
  return serverEnv.ADMIN_ALLOWED_EMAILS.split(',').map((e) => e.trim().toLowerCase())
}

export function isSuperadmin(email: string | undefined): boolean {
  if (!email) return false
  return getAllowedEmails().includes(email.toLowerCase())
}
