import { queryOptions } from '@tanstack/react-query'
import { adminGetOrgDetailFn } from '@/server/functions/get-org-detail.fn'
import { adminGetOrgMembersFn } from '@/server/functions/get-org-members.fn'

export const adminOrgDetailQueryOptions = (nanoId: string) =>
  queryOptions({
    queryKey: ['admin', 'org-detail', nanoId],
    queryFn: () => adminGetOrgDetailFn({ data: { nanoId } }),
    staleTime: 30_000,
  })

export const adminOrgMembersQueryOptions = (nanoId: string) =>
  queryOptions({
    queryKey: ['admin', 'org-members', nanoId],
    queryFn: () => adminGetOrgMembersFn({ data: { nanoId } }),
    staleTime: 30_000,
  })
