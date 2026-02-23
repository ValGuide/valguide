import { queryOptions } from '@tanstack/react-query'
import { type ApprovedDomain, getApprovedDomainsFn } from '@/server/functions/get-approved-domains.fn'

export const approvedDomainsQueryOptions = () =>
  queryOptions<ApprovedDomain[]>({
    queryKey: ['admin', 'approved-domains'],
    queryFn: () => getApprovedDomainsFn(),
  })
