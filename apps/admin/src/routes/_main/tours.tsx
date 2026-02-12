import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import type { ListToursInput } from '@valguide/core/features/admin/tours/list-tours.fn'
import { BookOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { ToursDataTable } from '@/features/admin/components/tours-data-table'
import { adminToursQueryOptions } from '@/features/admin/tours-query-options'

const toursSearchSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  sortBy: z.enum(['title', 'organizationName', 'stopCount', 'createdAt', 'publishedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof toursSearchSchema>): ListToursInput {
  const statusValues = search.status?.split(',').filter(Boolean)
  const singleStatus = statusValues?.length === 1 ? statusValues[0] : undefined
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    status: singleStatus as ListToursInput['status'],
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

  // Derive column filters from URL search params
  const statusValues = searchParams.status?.split(',').filter(Boolean)
  const columnFiltersFromUrl: ColumnFiltersState = [
    ...(searchParams.search ? [{ id: 'title', value: searchParams.search }] : []),
    ...(statusValues?.length ? [{ id: 'status', value: statusValues }] : []),
  ]

  const [debouncedFilters, setDebouncedFilters] = useState<ColumnFiltersState>(columnFiltersFromUrl)

  // Sync when URL changes externally (e.g., browser back)
  useEffect(() => {
    setDebouncedFilters(columnFiltersFromUrl)
    // Only re-sync when the actual URL values change
    // biome-ignore lint/correctness/useExhaustiveDependencies: derived from searchParams
  }, [searchParams.search, searchParams.status])

  const onColumnFiltersChange = useCallback(
    (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(debouncedFilters) : updater
      setDebouncedFilters(next)

      // Apply select filters (status) immediately — only debounce text filters
      const statusFilter = next.find((f) => f.id === 'status')?.value as string[] | undefined
      const statusParam = statusFilter?.length ? statusFilter.join(',') : undefined
      const currentStatus = searchParams.status ?? undefined
      if (statusParam !== currentStatus) {
        const titleFilter = next.find((f) => f.id === 'title')?.value as string | undefined
        navigate({
          to: '/tours',
          search: (prev) => ({
            ...prev,
            search: titleFilter || undefined,
            status: statusParam,
            page: 0,
          }),
        })
      }
    },
    [debouncedFilters, searchParams.status, navigate],
  )

  // Debounce text filter (title/search) to URL
  useEffect(() => {
    const titleFilter = debouncedFilters.find((f) => f.id === 'title')?.value as string | undefined
    const currentSearch = searchParams.search ?? undefined

    if (titleFilter === currentSearch) return

    const timeout = setTimeout(() => {
      const statusFilter = debouncedFilters.find((f) => f.id === 'status')?.value as string[] | undefined
      const statusParam = statusFilter?.length ? statusFilter.join(',') : undefined
      navigate({
        to: '/tours',
        search: (prev) => ({
          ...prev,
          search: titleFilter || undefined,
          status: statusParam,
          page: 0,
        }),
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [debouncedFilters, searchParams.search, navigate])

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
        search: (prev) => ({
          ...prev,
          page: next.pageIndex,
          pageSize: next.pageSize,
        }),
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
        columnFilters={debouncedFilters}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        isLoading={isFetching}
      />
    </div>
  )
}
