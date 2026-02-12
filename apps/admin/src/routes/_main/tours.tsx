import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import type { ListToursInput } from '@valguide/core/features/admin/tours/list-tours.fn'
import { BookOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { ToursDataTable } from '@/features/admin/components/tours-data-table'
import { adminToursQueryOptions } from '@/features/admin/tours-query-options'

const toursSearchSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['title', 'organizationName', 'stopCount', 'createdAt', 'publishedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof toursSearchSchema>): ListToursInput {
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    status: search.status,
    sortBy: search.sortBy ?? 'createdAt',
    sortOrder: search.sortOrder ?? 'desc',
  }
}

export const Route = createFileRoute('/_main/tours')({
  validateSearch: toursSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminToursQueryOptions(buildInput(deps)))
  },
  component: ToursPage,
})

function ToursPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()

  const input = buildInput(searchParams)
  const { data, isFetching } = useQuery(adminToursQueryOptions(input))

  const tours = data?.tours ?? []
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
          to: '/tours',
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
        to: '/tours',
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
        to: '/tours',
        search: (prev) => ({
          ...prev,
          sortBy: sort?.id as ListToursInput['sortBy'],
          sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          page: 0,
        }),
      })
    },
    [navigate, sorting],
  )

  // Status filter
  const onStatusFilterChange = useCallback(
    (value: 'draft' | 'published' | 'archived' | undefined) => {
      navigate({
        to: '/tours',
        search: (prev) => ({ ...prev, status: value, page: 0 }),
      })
    },
    [navigate],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="size-6" />
        <h1 className="text-2xl font-bold">Tours</h1>
      </div>

      <ToursDataTable
        data={tours}
        totalCount={totalCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        search={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={searchParams.status}
        onStatusFilterChange={onStatusFilterChange}
        isLoading={isFetching}
      />
    </div>
  )
}
