import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import type { ListOrgsInput } from '@valguide/core/features/admin/orgs/list-orgs.fn'
import { Building2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { OrgsDataTable } from '@/features/admin/components/orgs-data-table'
import { adminOrgsQueryOptions } from '@/features/admin/orgs-query-options'

const orgsSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  sortBy: z.enum(['name', 'memberCount', 'tourCount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof orgsSearchSchema>): ListOrgsInput {
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    sortBy: search.sortBy ?? 'createdAt',
    sortOrder: search.sortOrder ?? 'desc',
  }
}

export const Route = createFileRoute('/_main/orgs')({
  validateSearch: orgsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminOrgsQueryOptions(buildInput(deps)))
  },
  component: OrgsPage,
})

function OrgsPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()

  const input = buildInput(searchParams)
  const { data, isFetching } = useQuery(adminOrgsQueryOptions(input))

  const orgs = data?.orgs ?? []
  const totalCount = data?.totalCount ?? 0

  // Debounced search
  const [searchValue, setSearchValue] = useState(searchParams.search ?? '')

  // Sync search input when URL changes externally (e.g., browser back)
  useEffect(() => {
    setSearchValue(searchParams.search ?? '')
  }, [searchParams.search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.search ?? ''
      if (searchValue !== current) {
        navigate({
          to: '/orgs',
          search: (prev) => ({ ...prev, search: searchValue || undefined, page: 0 }),
        })
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchValue, searchParams.search, navigate])

  // Pagination state
  const pagination: PaginationState = {
    pageIndex: searchParams.page ?? 0,
    pageSize: searchParams.pageSize ?? 20,
  }

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      navigate({
        to: '/orgs',
        search: (prev) => ({ ...prev, page: next.pageIndex, pageSize: next.pageSize }),
      })
    },
    [navigate, pagination],
  )

  // Sorting state
  const sorting: SortingState = searchParams.sortBy
    ? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === 'desc' }]
    : []

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const sort = next[0]
      navigate({
        to: '/orgs',
        search: (prev) => ({
          ...prev,
          sortBy: sort?.id as ListOrgsInput['sortBy'],
          sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          page: 0,
        }),
      })
    },
    [navigate, sorting],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="size-6" />
        <h1 className="text-2xl font-bold">Organizations</h1>
      </div>

      <OrgsDataTable
        data={orgs}
        totalCount={totalCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        search={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isFetching}
      />
    </div>
  )
}
