/**
 * Get the display name for a user based on their profile, metadata, and email.
 *
 * Priority:
 * 1. Profile First Name + Last Name
 * 2. Profile First Name
 * 3. Profile Username
 * 4. User Metadata full_name
 * 5. Email username (part before @)
 * 6. Fallback (default: 'User')
 */
export function getUserDisplayName(
  profile: { firstName?: string | null; lastName?: string | null; username?: string | null } | null | undefined,
  email?: string | null,
  userMetadata?: { full_name?: string } | null,
  fallback: string = 'User',
): string {
  // Start with metadata name or email part as base
  let displayName = userMetadata?.full_name || email?.split('@')[0] || fallback

  if (profile) {
    if (profile.firstName && profile.lastName) {
      displayName = `${profile.firstName} ${profile.lastName}`
    } else if (profile.firstName) {
      displayName = profile.firstName
    } else if (profile.username) {
      displayName = profile.username
    }
  }

  return displayName
}
