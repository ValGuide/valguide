import { queryOptions } from '@tanstack/react-query'
import { type ApprovedDomain, getApprovedDomainsFn } from '../orgs/get-approved-domains.fn'

export const approvedDomainsQueryOptions = () =>
  queryOptions<ApprovedDomain[]>({
    queryKey: ['admin', 'approved-domains'],
    queryFn: () => getApprovedDomainsFn(),
  })
