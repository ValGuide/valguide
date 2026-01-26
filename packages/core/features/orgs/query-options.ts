import { queryOptions } from '@tanstack/react-query'
import { ensureDefaultTeamFn } from './ensure-default-team'

/**
 * Query options for ensuring user has a default team.
 * Uses staleTime: Infinity to only run ONCE per session.
 * Call this in beforeLoad to guarantee team exists before other data loads.
 */
export const ensureDefaultTeamQueryOptions = () =>
  queryOptions({
    queryKey: ['ensure-default-team'],
    queryFn: () => ensureDefaultTeamFn(),
    staleTime: Number.POSITIVE_INFINITY, // Only run ONCE per session
    gcTime: Number.POSITIVE_INFINITY, // Never garbage collect
  })
