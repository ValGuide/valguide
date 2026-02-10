const SUPERADMIN_EMAILS = ['curator@museum-zurich.example', 'curator@museum-zurich.example', 'ops@museum-zurich.example'] as const

export function isSuperadmin(email: string | undefined): boolean {
  if (!email) return false
  return SUPERADMIN_EMAILS.includes(email.toLowerCase() as (typeof SUPERADMIN_EMAILS)[number])
}
