import { getRouteApi } from '@tanstack/react-router'

const mainRoute = getRouteApi('/_main')

/**
 * Get the current organization's primary slug from route context.
 * Must be used within a /_main route (authenticated layout).
 */
export function useOrgSlug(): string {
  const { team } = mainRoute.useRouteContext()
  return team.orgSlug
}
