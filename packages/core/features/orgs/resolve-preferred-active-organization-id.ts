export function resolvePreferredActiveOrganizationId(
  preferredActiveOrganizationId: string | null,
  acceptedOrganizationIds: Set<string>,
): string | null {
  if (preferredActiveOrganizationId && acceptedOrganizationIds.has(preferredActiveOrganizationId)) {
    return preferredActiveOrganizationId
  }

  return acceptedOrganizationIds.values().next().value ?? null
}
