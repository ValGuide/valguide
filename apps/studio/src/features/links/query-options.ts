import { queryOptions } from '@tanstack/react-query'
import type { ManagedLinkListItem } from '@valguide/core/features/links/managed-links.fn'
import { listManagedLinksFn } from '@valguide/core/features/links/managed-links.fn'

export const managedLinksQueryKeys = {
  all: ['managed-links'] as const,
  list: (includeArchived = true) => ['managed-links', { includeArchived }] as const,
}

export const managedLinksQueryOptions = (includeArchived = true) =>
  queryOptions<ManagedLinkListItem[]>({
    queryKey: managedLinksQueryKeys.list(includeArchived),
    queryFn: () => listManagedLinksFn({ data: { includeArchived } }),
    staleTime: 30_000,
  })
